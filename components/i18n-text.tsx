"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { translationKey } from "@/lib/i18n/keys";

export function I18nText({
  i18nKey,
  source,
  values,
}: {
  i18nKey?: string;
  source: string;
  values?: Record<string, unknown>;
}) {
  const { t } = useTranslation();
  return (
    <>
      {t(i18nKey ?? translationKey(source), {
        defaultValue: source,
        ...values,
      })}
    </>
  );
}

const TRANSLATABLE_ATTRIBUTES = [
  "placeholder",
  "title",
  "aria-label",
  "aria-description",
  "alt",
] as const;

type AttributeTranslation = [key: string, source: string][];
const translatedAttributes = new WeakMap<
  Element,
  Map<string, { key: string; source: string; translated: string }>
>();

export function I18nAttributeProvider() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const updateElement = (element: Element) => {
      for (const attribute of TRANSLATABLE_ATTRIBUTES) {
        const marker = element.getAttribute(`data-i18n-${attribute}`);
        if (!marker) continue;

        try {
          const parsed = JSON.parse(marker) as AttributeTranslation | [string, string];
          const options = (
            Array.isArray(parsed[0]) ? parsed : [parsed]
          ) as AttributeTranslation;
          const current = element.getAttribute(attribute);
          if (!current || !Array.isArray(options)) continue;
          let memo = translatedAttributes.get(element);
          if (!memo) {
            memo = new Map();
            translatedAttributes.set(element, memo);
          }
          const previous = memo.get(attribute);
          const selected =
            previous?.translated === current
              ? previous
              : options.find(([, source]) => source === current) ??
                (options.length === 1 ? options[0] : undefined);
          if (!selected) continue;
          const key = Array.isArray(selected) ? selected[0] : selected.key;
          const source = Array.isArray(selected) ? selected[1] : selected.source;
          if (typeof key !== "string" || typeof source !== "string") continue;
          const translated = t(key, { defaultValue: source });
          memo.set(attribute, { key, source, translated });
          if (element.getAttribute(attribute) !== translated) {
            element.setAttribute(attribute, translated);
          }
        } catch {
          continue;
        }
      }
    };

    const update = () => {
      document
        .querySelectorAll(
          TRANSLATABLE_ATTRIBUTES.map(
            (attribute) => `[data-i18n-${attribute}]`,
          ).join(","),
        )
        .forEach(updateElement);
    };

    update();
    i18n.on("languageChanged", update);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") {
          record.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              updateElement(node);
              node
                .querySelectorAll(
                  TRANSLATABLE_ATTRIBUTES.map(
                    (attribute) => `[data-i18n-${attribute}]`,
                  ).join(","),
                )
                .forEach(updateElement);
            }
          });
        } else if (record.target instanceof Element) {
          updateElement(record.target);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    return () => {
      i18n.off("languageChanged", update);
      observer.disconnect();
    };
  }, [i18n, t]);

  return null;
}
