"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SettingsResult = { error?: string; success?: boolean };
type SettingsAction = (formData: FormData) => Promise<SettingsResult>;

export default function SettingsForm({
  action,
  deleteAction,
  children,
  buttonLabel,
  deleteLabel,
}: {
  action: SettingsAction;
  deleteAction?: () => Promise<SettingsResult>;
  children: React.ReactNode;
  buttonLabel: string;
  deleteLabel?: string;
}) {
  const router = useRouter();
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

  function handleDelete() {
    if (!deleteAction) return;
    setMessage({});
    startTransition(async () => {
      try {
        const result = await deleteAction();
        setMessage(result.error ? result : { success: true });
        if (!result.error) router.refresh();
      } catch (error) {
        setMessage({ error: error instanceof Error ? error.message : "Could not delete this item." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 grid gap-4 p-6">
      {message.error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message.error}</p>}
      {message.success && <p role="status" className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">Saved successfully.</p>}
      {children}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={isPending} className="btn-primary w-fit disabled:opacity-60">
          {isPending ? "Saving..." : buttonLabel}
        </button>
        {deleteAction && (
          <button type="button" onClick={handleDelete} disabled={isPending} className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-60">
            {deleteLabel ?? "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
