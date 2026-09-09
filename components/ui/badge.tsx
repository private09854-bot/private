type Tone = "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-500",
  warning: "bg-amber-100 text-amber-500",
  danger: "bg-red-50 text-red-500",
  neutral: "bg-slate-100 text-slate-500",
};

export default function Badge({
  children,
  tone = "success",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
