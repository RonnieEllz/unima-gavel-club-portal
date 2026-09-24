import { getMembershipPaymentDetails } from "@/lib/data";
import { updateMembershipPaymentDetails } from "@/lib/actions/admin";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function PaymentAccountsPage() {
  const paymentSettings = await getMembershipPaymentDetails();

  const updatePaymentAccounts = async (formData: FormData) => {
    "use server";
    return updateMembershipPaymentDetails(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-maroon-800 sm:text-3xl">Payment accounts</h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">Manage the banking numbers members can use to pay their club membership fee.</p>
      </div>

      <SettingsForm action={updatePaymentAccounts} buttonLabel="Save payment accounts">
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-maroon-800">Membership payment accounts</h2>
          <p className="text-sm text-gray-600">These payment details appear on the member dashboard.</p>
        </div>

        <div className="space-y-2">
          <label className="label-field">Membership fee</label>
          <input name="membership_fee_amount" defaultValue={paymentSettings.membership_fee_amount} placeholder="e.g. K 15,000" className="input-field" />
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="label-field">Bank (NB) account name</label>
            <input name="bank_nb_name" defaultValue={paymentSettings.bank_nb_name} placeholder="Account holder name" className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="label-field">Bank (NB) account number</label>
            <input name="bank_nb_number" defaultValue={paymentSettings.bank_nb_number} placeholder="Account number" className="input-field" />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="label-field">Mpamba account name</label>
            <input name="mpamba_name" defaultValue={paymentSettings.mpamba_name} placeholder="Account holder name" className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="label-field">Mpamba number</label>
            <input name="mpamba_number" defaultValue={paymentSettings.mpamba_number} placeholder="Phone number or wallet number" className="input-field" />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="label-field">Airtel Money account name</label>
            <input name="airtel_money_name" defaultValue={paymentSettings.airtel_money_name} placeholder="Account holder name" className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="label-field">Airtel Money number</label>
            <input name="airtel_money_number" defaultValue={paymentSettings.airtel_money_number} placeholder="Phone number or wallet number" className="input-field" />
          </div>
        </div>
      </SettingsForm>
    </div>
  );
}
