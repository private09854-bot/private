import Link from "next/link";
import { ShieldCheck, Check, ArrowLeft } from "lucide-react";
import BrandLogo from "./brand-logo";

const points = [
  "Four currency wallets from day one",
  "Transfers you can track end to end",
  "Freeze or limit a card in one tap",
];

/**
 * Shell for /login and /signup.
 *
 * Phones get a single scrollable column: a slim brand bar, then the form.
 * From `lg` up it becomes the two-column layout with the dark brand panel.
 */
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
    <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      {/* Brand panel — desktop only */}
      <div className="relative hidden flex-col justify-between bg-slate-900 p-10 xl:p-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[44%] lg:shrink-0">
        <Link href="/">
          <BrandLogo inverse />
        </Link>

        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl">
            Money that moves the way you do.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Hold four currencies, send and convert between them, and keep every
            card under your own control — from one account.
          </p>
          <ul className="flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span className="text-sm text-slate-300">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
          Encrypted sessions · Two-factor sign-in
        </div>
      </div>

      {/* Mobile brand bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5 sm:px-6 lg:hidden">
        <Link href="/" className="min-w-0 shrink">
          <BrandLogo compact />
        </Link>
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-12 lg:items-center lg:bg-slate-50 lg:py-10">
        <div className="flex w-full max-w-[400px] flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
              {heading}
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              {subheading}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
