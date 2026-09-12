"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateMeeting, type MeetingFormState } from "@/lib/actions/admin";
import type { Meeting } from "@/types/database";

const initialState: MeetingFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving..." : "Save Changes"}</button>;
}

export default function MeetingEditForm({ meeting }: { meeting: Meeting }) {
  const [state, formAction] = useFormState(updateMeeting.bind(null, meeting.id), initialState);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (state.success) detailsRef.current?.removeAttribute("open");
  }, [state.success]);

  return (
    <details ref={detailsRef} className="mt-2 text-xs text-gray-500">
      <summary className="cursor-pointer text-maroon-700 hover:underline">Edit</summary>
      <form action={formAction} className="mt-3 grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
        {state.error && <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-red-700">{state.error}</p>}
        <input name="title" defaultValue={meeting.title} required className="input-field" aria-label="Meeting title" />
        <input name="venue" defaultValue={meeting.venue} required className="input-field" aria-label="Meeting venue" />
        <input name="date" type="date" defaultValue={meeting.date} required className="input-field" aria-label="Meeting date" />
        <input name="time" type="time" defaultValue={meeting.time} required className="input-field" aria-label="Meeting time" />
        <textarea name="description" defaultValue={meeting.description ?? ""} rows={2} className="input-field sm:col-span-2" aria-label="Meeting description" />
        <div className="sm:col-span-2"><SubmitButton /></div>
      </form>
    </details>
  );
}
