"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Snowflake, Sun } from "lucide-react";
import { setUserFrozen } from "@/app/actions/admin";

export default function UserActions({
  userId,
  frozen,
}: {
  userId: string;
  frozen: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle() {
    setError("");
    startTransition(async () => {
      const res = await setUserFrozen(userId, !frozen);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={toggle}
        disabled={pending}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50 ${
          frozen
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        }`}
      >
        {frozen ? (
          <Sun className="size-3.5" />
        ) : (
          <Snowflake className="size-3.5" />
        )}
        {pending ? "Working…" : frozen ? "Unfreeze account" : "Freeze account"}
      </button>
      {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
