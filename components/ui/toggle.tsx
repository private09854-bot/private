"use client";

import { useState } from "react";

export default function Toggle({
  defaultOn = false,
  "aria-label": ariaLabel,
}: {
  defaultOn?: boolean;
  "aria-label"?: string;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-emerald-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
