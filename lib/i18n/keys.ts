export function translationKey(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `ui.${(hash >>> 0).toString(36)}`;
}

export function translationAttribute(
  attribute: "placeholder" | "title" | "aria-label" | "aria-description" | "alt",
  source: string | string[],
) {
  const sources = Array.isArray(source) ? source : [source];
  return {
    [`data-i18n-${attribute}`]: JSON.stringify([
      ...sources.map((value) => [translationKey(value), value]),
    ]),
  };
}
