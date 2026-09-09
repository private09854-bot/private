"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleDetectionRule } from "@/app/actions/admin";

export default function RuleToggle({
  id,
  defaultOn,
  "aria-label": ariaLabel,
}: {
  id: string;
  defaultOn: boolean;
  "aria-label"?: string;
}) {
  const router = useRouter();
  const [on, setOn] = useState(defaultOn);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await toggleDetectionRule(id);
      if (res.error) setOn(!next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={toggle}
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
