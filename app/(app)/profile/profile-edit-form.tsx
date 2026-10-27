"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { updateProfileDetails } from "@/app/actions/banking";

type ProfileValues = {
  firstName: string | null; middleName: string | null; lastName: string | null;
  username: string | null; phone: string | null; dob: string | null;
  addressLine: string | null; city: string | null; region: string | null;
  postalCode: string | null; countryCode: string | null;
};

const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

export default function ProfileEditForm({ user }: { user: ProfileValues }) {
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!editing) return <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700"><Pencil className="size-4" />Edit profile</button>;

  function save(formData: FormData) {
    setNotice(null);
    startTransition(async () => {
      const result = await updateProfileDetails({
        firstName: String(formData.get("firstName") ?? ""), middleName: String(formData.get("middleName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""), username: String(formData.get("username") ?? ""),
        phone: String(formData.get("phone") ?? ""), dob: String(formData.get("dob") ?? ""),
        addressLine: String(formData.get("addressLine") ?? ""), city: String(formData.get("city") ?? ""),
        region: String(formData.get("region") ?? ""), postalCode: String(formData.get("postalCode") ?? ""), countryCode: String(formData.get("countryCode") ?? ""),
      });
      if (result.error) return setNotice(result.error);
      setNotice(result.message ?? "Profile updated.");
      setEditing(false);
    });
  }

  return <form action={save} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-base font-bold text-slate-900">Edit personal details</h2><p className="mt-1 text-[13px] text-slate-500">Your email, account type, and bank account details are protected and cannot be changed here.</p></div><button type="button" aria-label="Cancel editing" onClick={() => setEditing(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="First name" name="firstName" value={user.firstName ?? ""} required /><Input label="Last name" name="lastName" value={user.lastName ?? ""} required />
      <Input label="Middle name (optional)" name="middleName" value={user.middleName ?? ""} /><Input label="Username" name="username" value={user.username ?? ""} required />
      <Input label="Phone number" name="phone" value={user.phone ?? ""} required /><Input label="Date of birth" name="dob" type="date" value={user.dob ?? ""} required />
      <div className="sm:col-span-2"><Input label="Street address" name="addressLine" value={user.addressLine ?? ""} required /></div>
      <Input label="City" name="city" value={user.city ?? ""} required /><Input label="State / region (optional)" name="region" value={user.region ?? ""} />
      <Input label="Postal / ZIP code" name="postalCode" value={user.postalCode ?? ""} required />
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-900">Country of residence<select name="countryCode" defaultValue={user.countryCode ?? "US"} className={field}>{COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select></label>
    </div>
    {notice && <p className="mt-4 text-sm font-medium text-red-600" role="alert">{notice}</p>}
    <div className="mt-5 flex items-center gap-3"><button disabled={pending} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{pending ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => setEditing(false)} className="px-3 py-2.5 text-[13px] font-semibold text-slate-600">Cancel</button></div>
  </form>;
}

function Input({ label, name, value, type = "text", required = false }: { label: string; name: string; value: string; type?: string; required?: boolean }) {
  return <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-900">{label}<input className={field} name={name} type={type} defaultValue={value} required={required} /></label>;
}
