"use client";

import { useState, useTransition } from "react";

type SettingsResult = { error?: string; success?: boolean };
type SettingsAction = (formData: FormData) => Promise<SettingsResult>;

export default function SettingsForm({
  action,
  children,
  buttonLabel,
}: {
  action: SettingsAction;
  children: React.ReactNode;
  buttonLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<SettingsResult>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage({});
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await action(formData);
        setMessage(result.error ? result : { success: true });
      } catch (error) {
        setMessage({ error: error instanceof Error ? error.message : "Could not save settings." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 grid gap-4 p-6">
      {message.error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message.error}</p>}
      {message.success && <p role="status" className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">Saved successfully.</p>}
      {children}
      <button type="submit" disabled={isPending} className="btn-primary w-fit disabled:opacity-60">
        {isPending ? "Saving..." : buttonLabel}
      </button>
    </form>
  );
}
