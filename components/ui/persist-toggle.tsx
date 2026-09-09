"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSetting } from "@/app/actions/banking";

export default function PersistToggle({
  settingKey,
  defaultOn = false,
  "aria-label": ariaLabel,
}: {
  settingKey: string;
  defaultOn?: boolean;
  "aria-label"?: string;
}) {
  const router = useRouter();
  const [on, setOn] = useState(defaultOn);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      const res = await updateSetting(settingKey, next);
      if (res.error) setOn(!next); // revert on failure
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
