"use client";

import { useState } from "react";

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
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
