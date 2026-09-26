"use client";

import { useState, useTransition } from "react";
import { resetMemberPassword, updateMemberDetails } from "@/lib/actions/admin";
import type { Profile } from "@/types/database";

export default function MemberDetailsForm({ member, canResetPasswords }: { member: Profile; canResetPasswords: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateMemberDetails(member.id, formData);
      if (result.error) setError(result.error);
      else setMessage("Member details updated.");
    });
  }

  function handleResetPassword() {
    if (newPassword.length < 8) {
      setError("Use at least 8 characters for the new member password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await resetMemberPassword(member.id, adminPassword, newPassword);
      if (result.error) setError(result.error);
      else {
        setMessage(result.message ?? "Member password reset successfully.");
        setResetPasswordOpen(false);
        setAdminPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 rounded-md bg-gray-50 p-3 sm:grid-cols-2">
      <input name="full_name" defaultValue={member.full_name} placeholder="Full name" className="input-field" required />
      <input name="program" defaultValue={member.program} placeholder="Program" className="input-field" required />
      <input name="year_of_study" type="number" min={1} max={6} defaultValue={member.year_of_study} placeholder="Year" className="input-field" required />
      <select name="sex" defaultValue={member.sex} className="input-field">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input name="phone_number" defaultValue={member.phone_number} placeholder="Phone number" className="input-field" required />
      <input name="holiday_residence" defaultValue={member.holiday_residence ?? ""} placeholder="Holiday residence" className="input-field" />
      <textarea name="learning_expectations" defaultValue={member.learning_expectations ?? ""} placeholder="Learning expectations" rows={3} className="input-field sm:col-span-2" />
      <textarea name="preferred_placement" defaultValue={member.preferred_placement ?? ""} placeholder="Preferred placement" rows={3} className="input-field sm:col-span-2" />
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button disabled={isPending} className="btn-primary !px-4 !py-2 text-sm">
          {isPending ? "Saving…" : "Save Member Details"}
        </button>
        {canResetPasswords && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setResetPasswordOpen(true)}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            Reset password
          </button>
        )}
        {message && <span className="text-sm text-green-700">{message}</span>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {resetPasswordOpen && (
        <div className="sm:col-span-2 fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
            <h2 id="reset-password-title" className="font-display text-xl font-bold text-maroon-800">Set member password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set a new password for <span className="font-semibold">{member.full_name}</span>.
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              placeholder="Your current password"
              className="input-field mt-4"
            />
            <p className="mt-3 text-xs text-gray-500">The member does not need to know their old password for this reset.</p>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New member password"
              className="input-field mt-3"
            />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              placeholder="Confirm new password"
              className="input-field mt-3"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setResetPasswordOpen(false); setAdminPassword(""); setNewPassword(""); setConfirmNewPassword(""); setError(null); }} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button
                type="button"
                disabled={isPending || adminPassword.length < 8 || newPassword.length < 8 || newPassword !== confirmNewPassword}
                onClick={handleResetPassword}
                className="btn-primary !px-4 !py-2 text-sm"
              >
                {isPending ? "Updating…" : "Set password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}