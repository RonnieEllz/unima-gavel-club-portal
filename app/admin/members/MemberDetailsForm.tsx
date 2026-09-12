"use client";

import { useState, useTransition } from "react";
import { updateMemberDetails } from "@/lib/actions/admin";
import type { Profile } from "@/types/database";

export default function MemberDetailsForm({ member }: { member: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div className="sm:col-span-2">
        <button disabled={isPending} className="btn-primary !px-4 !py-2 text-sm">
          {isPending ? "Saving…" : "Save Member Details"}
        </button>
        {message && <span className="ml-3 text-sm text-green-700">{message}</span>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}