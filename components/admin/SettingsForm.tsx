"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SettingsResult = { error?: string; success?: boolean };
type SettingsAction = (formData: FormData) => Promise<SettingsResult>;
type DeleteAction = (password: string) => Promise<SettingsResult>;

export default function SettingsForm({
  action,
  deleteAction,
  children,
  buttonLabel,
  deleteLabel,
}: {
  action: SettingsAction;
  deleteAction?: DeleteAction;
  children: React.ReactNode;
  buttonLabel: string;
  deleteLabel?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<SettingsResult>({});
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const pendingFormData = useRef<FormData | null>(null);
  const pendingDelete = useRef(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage({});
    pendingFormData.current = new FormData(event.currentTarget);
    pendingDelete.current = false;
    setPassword("");
    setShowPasswordPrompt(true);
  }

  function confirmPassword() {
    const formData = pendingFormData.current;
    const deleteActionToRun = pendingDelete.current ? deleteAction : undefined;
    if ((!formData && !deleteActionToRun) || !password) return;

    if (formData) formData.set("settings_password", password);
    setShowPasswordPrompt(false);
    startTransition(async () => {
      try {
        const result = deleteActionToRun ? await deleteActionToRun(password) : await action(formData as FormData);
        setMessage(result.error ? result : { success: true });
        if (!result.error && deleteActionToRun) router.refresh();
      } catch (error) {
        setMessage({ error: error instanceof Error ? error.message : "Could not save settings." });
      }
    });
  }

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    if (!deleteAction) return;
    pendingFormData.current = new FormData(event.currentTarget.form ?? undefined);
    pendingDelete.current = true;
    setMessage({});
    setPassword("");
    setShowPasswordPrompt(true);
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
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="settings-password-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 id="settings-password-title" className="font-display text-xl font-bold text-maroon-800">Confirm your password</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your password to confirm this settings change.</p>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") confirmPassword(); }}
              minLength={8}
              autoComplete="current-password"
              className="input-field mt-4"
              placeholder="Your password"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowPasswordPrompt(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={confirmPassword} disabled={password.length < 8 || isPending} className="btn-primary disabled:opacity-60">Confirm and save</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
