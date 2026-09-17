"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import { loginMember, type LoginFormState } from "@/lib/actions/auth";

const initialState: LoginFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Signing in…" : "Log In"}
    </button>
  );
}

function getTimeoutMinutes() {
  const configuredMinutes = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES ?? 60);
  const safeMinutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0 ? configuredMinutes : 60;
  return safeMinutes;
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginMember, initialState);
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const timeoutMinutes = getTimeoutMinutes();

  return (
    <>
      <PublicNavbar />
      <section className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="card w-full max-w-md p-8">
          <h1 className="font-display text-2xl font-bold text-maroon-800">Member Login</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back to UNIMA Gavel Club.</p>

          {state.error && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
          )}

          {params.get("timeout") === "1" && (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              Your session timed out after {timeoutMinutes} minutes of inactivity. Please sign in again.
            </p>
          )}

          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label htmlFor="email" className="label-field">Email Address</label>
              <input id="email" name="email" type="email" required className="input-field" />
            </div>
            <div>
              <label htmlFor="password" className="label-field">Password</label>
              <input id="password" name="password" type="password" required className="input-field" />
            </div>
            <SubmitButton />
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Not a member yet?{" "}
            <a href="/join" className="font-semibold text-maroon-700 hover:underline">
              Join the Club
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
