import Link from "next/link";
import {
  ArrowRight,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  LineChart,
  ShieldCheck,
  Lock,
  Bell,
  Fingerprint,
  Globe2,
  Check,
  Star,
  type LucideIcon,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import BrandLogo from "@/components/brand-logo";
import SupportChat from "@/components/support-chat";

/* ------------------------------------------------------------------ data */

const HERO_IMG =
  "https://images.unsplash.com/photo-1573496782432-8690d8148c46?auto=format&fit=crop&w=900&q=70";
const CARD_IMG =
  "https://images.unsplash.com/photo-1609429019995-8c40f49535a5?auto=format&fit=crop&w=1200&q=70";
const PHONE_IMG =
  "https://images.unsplash.com/photo-1599202875854-23b7cd490ff4?auto=format&fit=crop&w=900&q=70";

const quickFacts = [
  { value: "4", label: "Currencies in every account" },
  { value: "$0", label: "Monthly account fee" },
  { value: "2 min", label: "Average time to open" },
  { value: "24/7", label: "Support from a real person" },
];

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Wallet,
    title: "Multi-currency wallets",
    desc: "Hold US dollars, euros, pounds and Canadian dollars side by side. Switch your primary wallet whenever you like — no new account needed.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transfers that settle fast",
    desc: "Send to saved recipients in a couple of taps. Every transfer shows its status, reference and fee up front, so nothing is a surprise.",
  },
  {
    icon: CreditCard,
    title: "Cards you actually control",
    desc: "Freeze a card the second it goes missing, set your own spending limits, and see each authorisation as it lands.",
  },
  {
    icon: LineChart,
    title: "Currency conversion",
    desc: "Convert between your wallets at a live rate you can see before you confirm. The quote is locked while you check it over.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your account",
    desc: "Name, email and a password. That is the whole form — it takes about two minutes.",
  },
  {
    n: "02",
    title: "Set up your wallets",
    desc: "Four currency wallets are ready the moment you sign in. Pick the one you want as your default.",
  },
  {
    n: "03",
    title: "Start moving money",
    desc: "Add a recipient, send a transfer, convert between currencies, or order a card from the dashboard.",
  },
];

const security: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Lock,
    title: "Encrypted end to end",
    desc: "Your session and your data are encrypted in transit and at rest.",
  },
  {
    icon: Fingerprint,
    title: "Two-factor sign-in",
    desc: "Turn on a second step from settings and keep your account yours.",
  },
  {
    icon: Bell,
    title: "Alerts on every move",
    desc: "Get notified the moment money leaves or lands in your account.",
  },
  {
    icon: Globe2,
    title: "Device management",
    desc: "See everywhere you are signed in and sign out a device remotely.",
  },
];

const quotes = [
  {
    name: "Sarah Jenkins",
    role: "Freelance designer",
    avatar: "/avatars/sarah.png",
    text: "I invoice in three currencies and used to lose a chunk of it to conversion. Now I just hold each one and convert when the rate suits me.",
  },
  {
    name: "Omar Haddad",
    role: "Operations lead",
    avatar: "/avatars/omar.png",
    text: "Freezing a card from my phone took about four seconds. That alone was worth moving over.",
  },
  {
    name: "Priya Raman",
    role: "Small business owner",
    avatar: "/avatars/priya.png",
    text: "Every transfer shows me the fee and the reference before I confirm. I never have to guess what actually went out.",
  },
];

const faqs = [
  {
    q: "How long does it take to open an account?",
    a: "About two minutes. You need a name, an email address and a password — there is no card required and no credit check to sign up.",
  },
  {
    q: "Which currencies can I hold?",
    a: "Every account comes with four wallets: US dollars, euros, British pounds and Canadian dollars. You can set any of them as your primary wallet.",
  },
  {
    q: "What does it cost to send money?",
    a: "Transfers between Profintal accounts are free. Any fee on an outbound transfer is shown on the confirmation screen before you approve it.",
  },
  {
    q: "Can I freeze my card if I lose it?",
    a: "Yes — open the Cards page and freeze it instantly. Nothing will authorise while it is frozen, and you can unfreeze it just as quickly if it turns up.",
  },
  {
    q: "Is my money safe?",
    a: "Profintal Savings is a demonstration project built to showcase a full banking interface. It does not hold real money and is not connected to any payment network — see the notice at the bottom of this page.",
  },
];

const footerCols = [
  {
    title: "Product",
    links: ["Accounts", "Transfers", "Cards", "Currency exchange"],
  },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Help centre", "Security", "Status", "Blog"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Disclosures"] },
];

/* --------------------------------------------------------------- helpers */

const SECTION = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/* ------------------------------------------------------------------ page */

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-white">
      <SiteHeader />

      {/* ============================================================ HERO */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className={`${SECTION} py-14 sm:py-20 lg:py-24`}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-start gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="size-3.5" />
                No monthly fees, no minimum balance
              </span>

              <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
                Banking that keeps up with your money
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Profintal Savings gives you four currency wallets, transfers you
                can track, and cards you control — all from one clean dashboard
                that works just as well on your phone as on your laptop.
              </p>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  Open a free account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  Sign in
                </Link>
              </div>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {["Free to open", "Ready in 2 minutes", "Cancel any time"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-1.5">
                      <Check className="size-4 shrink-0 text-emerald-600" />
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-3xl bg-slate-200 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_IMG}
                  alt="A person checking their account balance on a phone"
                  className="aspect-[4/5] w-full object-cover sm:aspect-[3/2] lg:aspect-[4/5]"
                />
              </div>

              {/* Floating balance chip — hidden on the narrowest screens so it
                  can never push the layout sideways. */}
              <div className="absolute -bottom-5 left-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Total balance
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  $12,480.00
                </p>
                <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                  USD · EUR · GBP · CAD
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== QUICK FACTS */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className={`${SECTION} py-10 sm:py-12`}>
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {quickFacts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {f.value}
                </p>
                <p className="text-[13px] leading-snug text-slate-500">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= FEATURES */}
      <section id="features" className="bg-white">
        <div className={`${SECTION} py-16 sm:py-20 lg:py-24`}>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              What you get
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Everything in one place, nothing buried
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              We built the account we wanted to use ourselves: clear balances,
              honest fees, and controls that take one tap instead of a phone
              call.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md sm:p-7"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <f.icon className="size-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== CARDS SPLIT */}
      <section className="bg-slate-50">
        <div className={`${SECTION} py-16 sm:py-20 lg:py-24`}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 overflow-hidden rounded-3xl bg-slate-200 shadow-lg lg:order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CARD_IMG}
                alt="A payment card resting on a laptop keyboard"
                className="aspect-[3/2] w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="order-1 flex flex-col items-start gap-5 lg:order-2">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                Cards
              </p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Freeze it, limit it, watch it
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                Issue a virtual card in seconds and order a physical one when
                you need it. Set the monthly limit yourself, and if the card
                ever goes missing, freeze it from your phone before you have
                finished looking for it.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Instant freeze and unfreeze",
                  "Your own spending limit, changed any time",
                  "Live authorisations as they happen",
                  "Separate cards for separate budgets",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-700">
                    <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <span className="text-sm leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                Get your card
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== HOW IT WORKS */}
      <section className="bg-white">
        <div className={`${SECTION} py-16 sm:py-20 lg:py-24`}>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              Getting started
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Three steps and you are banking
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:mt-14 lg:gap-8">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col gap-3">
                <span className="text-4xl font-extrabold text-emerald-100">
                  {s.n}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= SECURITY */}
      <section id="security" className="bg-slate-900">
        <div className={`${SECTION} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-start gap-5">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-400">
                Security
              </p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                Your account, locked down by default
              </h2>
              <p className="text-base leading-relaxed text-slate-300">
                Security should not be something you have to go and switch on.
                Sessions are encrypted, sign-ins are checked, and you can see
                every device connected to your account from the settings page.
              </p>
              <div className="mt-2 w-full overflow-hidden rounded-2xl bg-slate-800 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PHONE_IMG}
                  alt="Approving a payment on a mobile phone"
                  className="aspect-[3/2] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:content-start">
              {security.map((s) => (
                <div
                  key={s.title}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 sm:p-6"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <s.icon className="size-5" />
                  </span>
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== TESTIMONIALS */}
      <section className="bg-white">
        <div className={`${SECTION} py-16 sm:py-20 lg:py-24`}>
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Why people choose Profintal
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {quotes.map((q) => (
              <figure
                key={q.name}
                className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7"
              >
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-700">
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={q.avatar}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {q.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {q.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== FAQ */}
      <section id="faq" className="bg-slate-50">
        <div className={`${SECTION} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Questions, answered
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Still stuck? Tap the support button in the corner and a real
                person will get back to you.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-bold text-slate-900 sm:text-base">
                    <span className="min-w-0">{f.q}</span>
                    <span className="mt-0.5 shrink-0 text-lg leading-none text-emerald-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== CTA */}
      <section className="bg-white">
        <div className={`${SECTION} py-16 sm:py-20`}>
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-emerald-600 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                Open your account today
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50 sm:text-base">
                It is free, it takes about two minutes, and you can start moving
                money the moment you are in.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 sm:w-auto"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================== FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-900">
        <div className={`${SECTION} py-14 sm:py-16`}>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
            <div className="flex max-w-sm flex-col gap-4">
              <BrandLogo inverse />
              <p className="text-sm leading-relaxed text-slate-400">
                Multi-currency wallets, transfers you can track, and cards you
                control — in one account built to stay out of your way.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {footerCols.map((col) => (
                <div key={col.title} className="flex min-w-0 flex-col gap-3">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-white">
                    {col.title}
                  </p>
                  {col.links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="text-[13px] text-slate-400 transition-colors hover:text-white"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-slate-700 pt-8">
            <p className="text-xs leading-relaxed text-slate-400">
              <span className="font-bold text-slate-300">
                Demonstration project.
              </span>{" "}
              Profintal Savings is a portfolio build created to showcase a
              complete banking interface. It is not a bank or a licensed
              financial institution, it holds no real money, and it is not
              connected to any payment network. Balances, transactions and
              customer quotes shown on this site are illustrative.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 text-[13px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Profintal Savings.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#" className="transition-colors hover:text-white">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Status
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SupportChat />
    </main>
  );
}
