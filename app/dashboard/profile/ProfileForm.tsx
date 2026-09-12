"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateOwnProfile, type UpdateProfileState } from "@/lib/actions/profile";
import type { Profile } from "@/types/database";

const initialState: UpdateProfileState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : "Save Changes"}
    </button>
  );
}

export default function ProfileForm({ profile, canEdit }: { profile: Profile; canEdit: boolean }) {
  const [state, formAction] = useFormState(updateOwnProfile, initialState);

  if (!canEdit) {
    return (
      <section className="card mt-6 space-y-5 p-6">
        <div>
          <p className="text-sm font-semibold text-gray-500">Phone Number</p>
          <p className="mt-1 text-base text-gray-800">{profile.phone_number || "Not provided"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Where do you reside when on holiday?</p>
          <p className="mt-1 whitespace-pre-wrap text-base text-gray-800">
            {profile.holiday_residence || "Not provided"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">What do you hope to learn and experience?</p>
          <p className="mt-1 whitespace-pre-wrap text-base text-gray-800">
            {profile.learning_expectations || "Not provided"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Where do you believe you should be placed?</p>
          <p className="mt-1 whitespace-pre-wrap text-base text-gray-800">
            {profile.preferred_placement || "Not provided"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="card mt-6 space-y-4 p-6">
      {state.success && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">Profile updated successfully.</p>
      )}
      {state.error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {!canEdit && (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Only an administrator can change these details. Contact the club executive if they need updating.
        </p>
      )}

      <div>
        <label className="label-field">Phone Number</label>
        <input name="phone_number" defaultValue={profile.phone_number} readOnly={!canEdit} className="input-field read-only:bg-gray-50" />
      </div>
      <div>
        <label className="label-field">Where do you reside when on holiday?</label>
        <input
          name="holiday_residence"
          defaultValue={profile.holiday_residence ?? ""}
          readOnly={!canEdit}
          className="input-field read-only:bg-gray-50"
        />
      </div>
      <div>
        <label className="label-field">What do you hope to learn and experience?</label>
        <textarea
          name="learning_expectations"
          defaultValue={profile.learning_expectations ?? ""}
          rows={4}
          readOnly={!canEdit}
          className="input-field read-only:bg-gray-50"
        />
      </div>
      <div>
        <label className="label-field">Where do you believe you should be placed?</label>
        <textarea
          name="preferred_placement"
          defaultValue={profile.preferred_placement ?? ""}
          rows={3}
          readOnly={!canEdit}
          className="input-field read-only:bg-gray-50"
        />
      </div>
      {canEdit && <SaveButton />}
    </form>
  );
}
