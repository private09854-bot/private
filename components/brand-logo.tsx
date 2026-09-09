import Image from "next/image";

export default function BrandLogo({
  href,
  compact = false,
  inverse = false,
}: {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
}) {
  const content = (
    <span className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-900/20 bg-white">
        <Image
          src="/profintal-savings-mark.svg"
          alt=""
          width={64}
          height={64}
          className="size-full object-cover"
          priority
        />
      </span>
      <span
        className={`whitespace-nowrap text-base font-bold tracking-tight ${
          inverse ? "text-white" : "text-slate-900"
        }`}
      >
        Profintal Savings
      </span>
    </span>
  );

  if (!href) return content;
  return <a href={href}>{content}</a>;
}
