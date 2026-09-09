import { ShieldCheck } from "lucide-react";
import BrandLogo from "./brand-logo";

// Shared two-column shell for the /login and /signup screens: dark brand panel
// on the left, form content (passed as children) on the right.
export default function AuthShell({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Brand panel */}
      <div className="relative hidden w-[45%] flex-col justify-between bg-slate-900 p-12 lg:flex">
        <BrandLogo inverse />
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-[-0.5px] text-white">
            The consolidated multi-currency banking console.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Move money across borders, manage cards, and monitor risk from a
            single verified institution portal.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="size-4 text-emerald-500" />
          Bank-grade encryption • SOC 2 Type II
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="flex w-full max-w-[400px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-[-0.5px] text-slate-900">
              {heading}
            </h2>
            <p className="text-sm text-slate-500">{subheading}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
