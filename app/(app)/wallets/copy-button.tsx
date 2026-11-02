"use client";

import { useState } from "react";
import { I18nText } from "@/components/i18n-text";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <button
      onClick={onCopy}
      className={`rounded border px-2 py-1 text-[11px] font-semibold transition-colors ${
        copied
          ? "border-emerald-500 text-emerald-500"
          : "border-slate-200 text-slate-500 hover:bg-white"
      }`}
    >
      {copied ? <I18nText i18nKey="ui.13bzcw5" source="Copied" /> : <I18nText i18nKey="ui.s6g5lw" source="Copy" />}
    </button>
  );
}
