"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeDevice } from "@/app/actions/banking";
import { I18nText } from "@/components/i18n-text";

export default function RemoveDeviceButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onRemove() {
    startTransition(async () => {
      await removeDevice(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={onRemove}
      disabled={pending}
      className="text-[11px] font-semibold text-red-500 transition-colors hover:text-red-600 disabled:opacity-60"
    >
      {pending ? <I18nText i18nKey="ui.9uv2ds" source="Removing…" /> : <I18nText i18nKey="ui.9c35st" source="Remove" />}
    </button>
  );
}
