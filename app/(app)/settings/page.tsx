import { Laptop, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { formatNumber } from "@/lib/format";
import PersistToggle from "@/components/ui/persist-toggle";
import RemoveDeviceButton from "./remove-device-button";
import { I18nText } from "@/components/i18n-text";

const Divider = () => <div className="h-px w-full bg-slate-200" />;

const deviceIcon: Record<string, LucideIcon> = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

export default async function SettingsPage() {
  const user = await requireCustomer();

  const [settingsRes, devicesRes] = await Promise.all([
    supabaseAdmin
      .from("user_settings")
      .select("*")
      .eq("ownerId", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("devices")
      .select("*")
      .eq("ownerId", user.id)
      .order("sort"),
  ]);

  const settings = settingsRes.data;
  const devices = devicesRes.data ?? [];

  const s = settings ?? {
    twoFactor: true,
    loginNotifications: true,
    txnAlerts: true,
    securityLog: true,
    marketing: false,
    fxTriggers: true,
    dailyUsed: 0,
    dailyLimit: 50000,
    monthlyUsed: 0,
    monthlyLimit: 500000,
    singleCap: 10000,
  };

  const dailyPct = Math.min(100, Math.round((s.dailyUsed / s.dailyLimit) * 100));
  const monthlyPct = Math.min(
    100,
    Math.round((s.monthlyUsed / s.monthlyLimit) * 100),
  );

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
            <I18nText i18nKey="ui.1d7qcxe" source="Security & Settings" /></h1>
          <p className="text-sm text-slate-600">
            <I18nText i18nKey="ui.3rbok4" source="Configure and lock security permissions, multi-factor triggers and institution boundaries." /></p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="text-[13px] font-bold text-emerald-500">
            {user.kycStatus ?? "Verified"}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Profile */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar ?? "/avatars/sarah.png"}
                alt={user.name}
                className="size-16 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1.5">
                <p className="text-lg font-bold text-slate-900">{user.name}</p>
                <p className="text-[13px] text-slate-500">
                  {user.email} <I18nText i18nKey="ui.aw0l2d" source="•" />{user.title ?? "Account Holder"}
                </p>
                <span className="w-fit rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                  <I18nText i18nKey="ui.1ptu40u" source="KYC" />{user.tier ?? "Tier 3"} {user.kycStatus ?? "Verified"}
                </span>
              </div>
            </div>
            <Link href="/profile" className="rounded-lg border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
              <I18nText i18nKey="ui.iwkugc" source="Edit Profile" /></Link>
          </div>

          {/* Security Protocols */}
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-slate-900">
                <I18nText i18nKey="ui.9xr7ji" source="Security Protocols" /></h2>
              <p className="text-[13px] text-slate-500">
                <I18nText i18nKey="ui.noh2z5" source="Define limits for authentication validation and recovery loops." /></p>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-900">
                  <I18nText i18nKey="ui.18dcp8n" source="Two-Factor Authentication (2FA)" /></p>
                <p className="text-xs text-slate-500">
                  <I18nText i18nKey="ui.1itqmy2" source="Mandatory for high-value and international transfers." /></p>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-600">
                  <I18nText i18nKey="ui.lakfv2" source="Change Method" /></button>
                <PersistToggle
                  settingKey="twoFactor"
                  defaultOn={s.twoFactor}
                  aria-label="Two-Factor Authentication" data-i18n-aria-label={"[\"ui.7cwugx\",\"Two-Factor Authentication\"]"}
                />
              </div>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-900">
                  <I18nText i18nKey="ui.dlu2iy" source="Login Notifications" /></p>
                <p className="text-xs text-slate-500">
                  <I18nText i18nKey="ui.7igtaq" source="Get notified instantly when a new device signs into your console." /></p>
              </div>
              <PersistToggle
                settingKey="loginNotifications"
                defaultOn={s.loginNotifications}
                aria-label="Login Notifications" data-i18n-aria-label={"[\"ui.dlu2iy\",\"Login Notifications\"]"}
              />
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-900">
                  <I18nText i18nKey="ui.1uljvoe" source="Password Security" /></p>
                <p className="text-xs text-slate-500">
                  <I18nText i18nKey="ui.19pj28" source="Use a strong, unique password and rotate it periodically." /></p>
              </div>
              <button className="rounded-md border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                <I18nText i18nKey="ui.100ew7i" source="Change Password" /></button>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-900">
                  <I18nText i18nKey="ui.10zf1gc" source="Backup Recovery Codes" /></p>
                <p className="text-xs text-slate-500">
                  <I18nText i18nKey="ui.1ximaer" source="Offline backup codes for account recovery." /></p>
              </div>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-600">
                <I18nText i18nKey="ui.1nc1tqn" source="Regenerate" /></button>
            </div>
          </div>

          {/* Transfer Limits Boundary */}
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-slate-900">
                <I18nText i18nKey="ui.6kjtzs" source="Transfer Limits Boundary" /></h2>
              <p className="text-[13px] text-slate-500">
                <I18nText i18nKey="ui.wt2aye" source="Adjust daily and weekly settlement thresholds for all multi-currency pools." /></p>
            </div>
            <Divider />

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-900">
                  <I18nText i18nKey="ui.ivkie6" source="Daily Threshold Usage" /></span>
                <span className="text-[13px] font-semibold text-slate-600">
                  <I18nText i18nKey="ui.9647jn" source="$" />{formatNumber(s.dailyUsed)} <I18nText i18nKey="ui.jinr6i" source="/ $" />{formatNumber(s.dailyLimit)} <I18nText i18nKey="ui.174gkvb" source="USD" /></span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${dailyPct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-900">
                  <I18nText i18nKey="ui.1c0oigm" source="Monthly Accumulative limit" /></span>
                <span className="text-[13px] font-semibold text-slate-600">
                  <I18nText i18nKey="ui.9647jn" source="$" />{formatNumber(s.monthlyUsed)} <I18nText i18nKey="ui.jinr6i" source="/ $" />{formatNumber(s.monthlyLimit)}{" "}
                  <I18nText i18nKey="ui.174gkvb" source="USD" /></span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${monthlyPct}%` }}
                />
              </div>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <p className="text-[13px]">
                <span className="text-slate-500"><I18nText i18nKey="ui.17mds2e" source="Single Transfer Cap:" /></span>
                <span className="font-bold text-slate-900">
                  <I18nText i18nKey="ui.9647jn" source="$" />{formatNumber(s.singleCap, 2)} <I18nText i18nKey="ui.174gkvb" source="USD" /></span>
              </p>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-600">
                <I18nText i18nKey="ui.10ir1bz" source="Request limit increase" /></button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[480px]">
          {/* Audit & Alert */}
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-slate-900">
                <I18nText i18nKey="ui.xeftze" source="Audit & Alert Routing" /></h2>
              <p className="text-[13px] text-slate-500">
                <I18nText i18nKey="ui.frvkrg" source="Control routing paths for ledger updates." /></p>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-900">
                <I18nText i18nKey="ui.1vfie73" source="Transaction Activity Alerts" /></p>
              <div className="flex items-center gap-3">
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">
                  <I18nText i18nKey="ui.inbfc7" source="Email" /></span>
                <PersistToggle
                  settingKey="txnAlerts"
                  defaultOn={s.txnAlerts}
                  aria-label="Transaction Activity Alerts" data-i18n-aria-label={"[\"ui.1vfie73\",\"Transaction Activity Alerts\"]"}
                />
              </div>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-900">
                <I18nText i18nKey="ui.vhrm4i" source="Security Log Events" /></p>
              <div className="flex items-center gap-3">
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">
                  <I18nText i18nKey="ui.1ut6akd" source="Push" /></span>
                <PersistToggle
                  settingKey="securityLog"
                  defaultOn={s.securityLog}
                  aria-label="Security Log Events" data-i18n-aria-label={"[\"ui.vhrm4i\",\"Security Log Events\"]"}
                />
              </div>
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-900">
                <I18nText i18nKey="ui.12fhqqv" source="Lumen Marketing Signals" /></p>
              <PersistToggle
                settingKey="marketing"
                defaultOn={s.marketing}
                aria-label="Lumen Marketing Signals" data-i18n-aria-label={"[\"ui.12fhqqv\",\"Lumen Marketing Signals\"]"}
              />
            </div>
            <Divider />

            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-900">
                <I18nText i18nKey="ui.bl58zb" source="Fx Rate Trigger Indicators" /></p>
              <PersistToggle
                settingKey="fxTriggers"
                defaultOn={s.fxTriggers}
                aria-label="Fx Rate Trigger Indicators" data-i18n-aria-label={"[\"ui.bl58zb\",\"Fx Rate Trigger Indicators\"]"}
              />
            </div>
          </div>

          {/* Linked Hardware Keys */}
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-slate-900">
                <I18nText i18nKey="ui.1jumm98" source="Linked Hardware Keys" /></h2>
              <p className="text-[13px] text-slate-500">
                <I18nText i18nKey="ui.syur5x" source="Entities with direct active keys signed into Profintal Savings." /></p>
            </div>
            <Divider />

            <div className="flex flex-col gap-3">
              {devices.map((dv) => {
                const Icon = deviceIcon[dv.kind] ?? Laptop;
                return (
                  <div
                    key={dv.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 text-slate-700" />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] font-semibold text-slate-900">
                          {dv.name}
                        </p>
                        <p className="text-[11px] text-slate-500">{dv.meta}</p>
                      </div>
                    </div>
                    {dv.current ? (
                      <span className="text-[11px] font-semibold text-emerald-500">
                        <I18nText i18nKey="ui.1dw4k8q" source="Current" /></span>
                    ) : (
                      <RemoveDeviceButton id={dv.id} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
