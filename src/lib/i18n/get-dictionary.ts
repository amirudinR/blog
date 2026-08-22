import "server-only";

import type { Locale } from "./config";

const dictionaries = {
  id: () => import("./dictionaries/id.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["id"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (dictionaries[locale] ?? dictionaries.id)();
}
