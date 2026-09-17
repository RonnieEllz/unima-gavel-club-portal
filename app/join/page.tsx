"use client";

import { useFormState, useFormStatus } from "react-dom";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import { registerMember, type RegisterFormState } from "@/lib/actions/auth";

const initialState: RegisterFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Submitting…" : "Submit Application"}
    </button>
  );
}

export default function JoinPage() {
  const [state, formAction] = useFormState(registerMember, initialState);

  if (state.success) {
    return (
      <>
        <PublicNavbar />
        <section className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="card max-w-lg p-10">
            <h1 className="font-display text-2xl font-bold text-maroon-800">
              Thank you for your interest in joining UNIMA Gavel Club.
            </h1>
            <p className="mt-3 text-gray-600">Your application has been received.</p>
            <p className="mt-1 text-sm text-gray-500">
              An administrator will review your application. Once approved, log in with the email
              and password you just created.
            </p>
            <a href="/login" className="btn-secondary mt-6 inline-flex">
              Go to Member Login
            </a>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PublicNavbar />
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-maroon-800">Join UNIMA Gavel Club</h1>
          <p className="mt-2 text-gray-600">
            Tell us a little about yourself. This creates your member account as well as your
            application.
          </p>

          {state.error && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
          )}

          <form action={formAction} className="mt-8 space-y-6">
            <fieldset className="card space-y-4 p-6">
              <legend className="px-1 font-semibold text-maroon-800">Personal Information</legend>

              <Field label="Full Name" name="full_name" error={state.fieldErrors?.full_name} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Program of Study" name="program" error={state.fieldErrors?.program} required />
                <Field
                  label="Year of Study"
                  name="year_of_study"
                  type="number"
                  min={1}
                  max={6}
                  error={state.fieldErrors?.year_of_study}
                  required
                />
              </div>

              <div>
                <label className="label-field">Sex</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="sex" value="male" required /> Male
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="sex" value="female" required /> Female
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone Number" name="phone_number" type="tel" error={state.fieldErrors?.phone_number} required />
                <Field label="Where do you reside when on holiday?" name="holiday_residence" />
              </div>
            </fieldset>

            <fieldset className="card space-y-4 p-6">
              <legend className="px-1 font-semibold text-maroon-800">Motivation</legend>
              <div>
                <label className="label-field">
                  In brief, what do you hope to learn and experience from joining us?
                </label>
                <textarea name="learning_expectations" rows={4} className="input-field" />
              </div>
              <div>
                <label className="label-field">
                  Based on your responses, where do you believe you should be placed in order to
                  learn and grow?
                </label>
                <textarea name="preferred_placement" rows={3} className="input-field" />
              </div>
            </fieldset>

            <fieldset className="card space-y-4 p-6">
              <legend className="px-1 font-semibold text-maroon-800">Account Login</legend>
              <Field label="Email Address" name="email" type="email" error={state.fieldErrors?.email} required />
              <Field
                label="Password"
                name="password"
                type="password"
                hint="At least 8 characters."
                error={state.fieldErrors?.password}
                required
              />
            </fieldset>

            <SubmitButton />
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  hint,
  required,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="label-field">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        className="input-field"
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
