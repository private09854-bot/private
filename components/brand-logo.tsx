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
    <span className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-900/20 bg-white ${
          compact ? "size-8" : "size-11"
        }`}
      >
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
        className={`whitespace-nowrap font-bold tracking-tight ${
          compact ? "text-sm" : "text-base"
        } ${inverse ? "text-white" : "text-slate-900"}`}
      >
        Profintal Savings
      </span>
    </span>
  );

  if (!href) return content;
  return <a href={href}>{content}</a>;
}
