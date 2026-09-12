"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createMeeting, type MeetingFormState } from "@/lib/actions/admin";

const initialState: MeetingFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Creating…" : "Create Meeting"}
    </button>
  );
}

export default function MeetingForm() {
  const [state, formAction] = useFormState(createMeeting, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
      {state.error && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="sm:col-span-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Meeting created successfully.
        </p>
      )}
      <div>
        <label className="label-field">Title</label>
        <input name="title" required className="input-field" />
      </div>
      <div>
        <label className="label-field">Venue</label>
        <input name="venue" required className="input-field" />
      </div>
      <div>
        <label className="label-field">Date</label>
        <input name="date" type="date" required className="input-field" />
      </div>
      <div>
        <label className="label-field">Time</label>
        <input name="time" type="time" required className="input-field" />
      </div>
      <div className="sm:col-span-2">
        <label className="label-field">Description</label>
        <textarea name="description" rows={2} className="input-field" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}