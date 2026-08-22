export const i18n = {
  locales: ["id", "en"],
  defaultLocale: "id",
} as const;

export type Locale = (typeof i18n)["locales"][number];

export function isValidLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}
