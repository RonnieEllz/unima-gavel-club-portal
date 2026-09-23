"use client";

import { useState, useTransition } from "react";
import { bulkSetMembershipStatus } from "@/lib/actions/admin";
import type { MembershipStatus, Profile } from "@/types/database";
import type { OperationalSummary } from "@/lib/operational-status";
import MemberStatusControl from "./MemberStatusControl";
import MemberDetailsForm from "./MemberDetailsForm";
import PaymentStatusControl from "./PaymentStatusControl";
import AchievementBadges from "@/components/AchievementBadges";

const statusOptions: MembershipStatus[] = ["pending", "active", "inactive", "rejected", "alumni"];

type MemberWithOperationalStatus = Profile & { operationalSummary: OperationalSummary; completedMeetingCount: number };

export default function BulkMemberStatusForm({ members }: { members: MemberWithOperationalStatus[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<MembershipStatus>("active");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleMember = (memberId: string) => {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === members.length ? [] : members.map((member) => member.id)
    );
  };

  return (
    <div className="card mt-6 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as MembershipStatus)}
            className="input-field max-w-[10rem]"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isPending || selectedIds.length === 0}
            onClick={() => {
              setMessage(null);
              setError(null);
              setConfirmOpen(true);
            }}
            className="btn-primary !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Updating…" : "Apply to selected"}
          </button>
        </div>
      </div>

      {message && <p className="px-4 pb-3 text-sm text-green-700">{message}</p>}
      {error && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="bulk-status-title">
            <h2 id="bulk-status-title" className="font-display text-xl font-bold text-maroon-800">Confirm status update</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set {selectedIds.length} selected member{selectedIds.length === 1 ? "" : "s"} to <span className="font-semibold capitalize">{status}</span>?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setConfirmOpen(false);
                  startTransition(async () => {
                    const result = await bulkSetMembershipStatus(selectedIds, status);
                    if (result?.error) {
                      setError(result.error);
                      return;
                    }
                    setSelectedIds([]);
                    setMessage(`Updated ${result.updated ?? selectedIds.length} member${selectedIds.length === 1 ? "" : "s"}.`);
                  });
                }}
                className="btn-primary !px-4 !py-2 text-sm"
              >
                {isPending ? "Updating..." : "Confirm update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100 md:hidden">
        {members.map((member) => {
          const selected = selectedIds.includes(member.id);
          return (
            <article key={member.id} className={`space-y-3 p-4 ${selected ? "bg-maroon-50/60" : "bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMember(member.id)}
                    aria-label={`Select ${member.full_name}`}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-gray-800">{member.full_name}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{member.program} · Year {member.year_of_study}</span>
                  </span>
                </label>
                <span className="shrink-0 text-xs capitalize text-gray-500">{member.sex}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Membership</p>
                  <MemberStatusControl memberId={member.id} currentStatus={member.membership_status} />
                </div>
                <div>
                  <p className="text-gray-400">Payment</p>
                  <PaymentStatusControl memberId={member.id} paid={member.payment_verified} />
                </div>
                <div>
                  <p className="text-gray-400">Operational</p>
                  <p className={member.operationalSummary.status === "active" ? "font-semibold text-green-700" : member.operationalSummary.status === "review" ? "font-semibold text-amber-700" : "text-gray-500"}>
                    {member.operationalSummary.status === "review" ? "Review required" : member.operationalSummary.status}
                  </p>
                  <p className="text-gray-500">{member.operationalSummary.attendedCount} attended · {member.operationalSummary.missedCount} missed</p>
                </div>
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="truncate text-gray-700">{member.phone_number}</p>
                </div>
              </div>
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-semibold text-maroon-700">View details and badges</summary>
                <div className="mt-3 space-y-2">
                  <p><b>Holiday residence:</b> {member.holiday_residence || "-"}</p>
                  <p><b>Learning goals:</b> {member.learning_expectations || "-"}</p>
                  <p><b>Preferred placement:</b> {member.preferred_placement || "-"}</p>
                  <AchievementBadges attendedCount={member.operationalSummary.attendedCount} completedMeetingCount={member.completedMeetingCount} sex={member.sex} />
                  <MemberDetailsForm member={member} />
                </div>
              </details>
            </article>
          );
        })}
      </div>

      <table className="hidden w-full min-w-[850px] text-left text-sm md:table">
        <thead className="bg-maroon-50 text-maroon-800">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={members.length > 0 && selectedIds.length === members.length}
                onChange={toggleAll}
                aria-label="Select all members"
                className="h-4 w-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700"
              />
            </th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Program / Year</th>
            <th className="px-4 py-3 font-semibold">Sex</th>
            <th className="px-4 py-3 font-semibold">Phone</th>
            <th className="px-4 py-3 font-semibold">Membership</th>
            <th className="px-4 py-3 font-semibold">Payment</th>
            <th className="px-4 py-3 font-semibold">Operational</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((member) => {
            const selected = selectedIds.includes(member.id);

            return (
              <tr key={member.id} className={selected ? "bg-maroon-50/60" : undefined}>
                <td className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMember(member.id)}
                    aria-label={`Select ${member.full_name}`}
                    className="h-4 w-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700"
                  />
                </td>
                <td className="px-4 py-3 align-top font-medium text-gray-800">{member.full_name}</td>
                <td className="px-4 py-3 align-top text-gray-600">
                  {member.program} · Yr {member.year_of_study}
                </td>
                <td className="px-4 py-3 align-top capitalize text-gray-600">{member.sex}</td>
                <td className="px-4 py-3 align-top text-gray-600">{member.phone_number}</td>
                <td className="px-4 py-3 align-top">
                  <MemberStatusControl memberId={member.id} currentStatus={member.membership_status} />
                </td>
                <td className="px-4 py-3 align-top">
                  <PaymentStatusControl memberId={member.id} paid={member.payment_verified} />
                  {member.last_payment_date && (
                    <p className="mt-1 text-xs text-gray-500">{new Date(member.last_payment_date).toLocaleDateString()}</p>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={
                      member.operationalSummary.status === "active"
                        ? "font-semibold text-green-700"
                        : member.operationalSummary.status === "review"
                          ? "font-semibold text-amber-700"
                          : "text-gray-500"
                    }
                  >
                    {member.operationalSummary.status === "review" ? "Review required" : member.operationalSummary.status}
                    <p className="mt-1 text-xs text-gray-500">
                      {member.operationalSummary.attendedCount} attended · {member.operationalSummary.missedCount} missed
                    </p>
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer text-maroon-700 hover:underline">View</summary>
                    <div className="mt-2 max-w-2xl space-y-1">
                      <p><b>Holiday residence:</b> {member.holiday_residence || "-"}</p>
                      <p><b>Learning goals:</b> {member.learning_expectations || "-"}</p>
                      <p><b>Preferred placement:</b> {member.preferred_placement || "-"}</p>
                      <AchievementBadges
                        attendedCount={member.operationalSummary.attendedCount}
                        completedMeetingCount={member.completedMeetingCount}
                        sex={member.sex}
                      />
                      <MemberDetailsForm member={member} />
                    </div>
                  </details>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
