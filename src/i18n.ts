import en from './locales/en.json';
import zh from './locales/zh.json';

export type Language = 'en' | 'zh';
export type LocaleKey = keyof typeof en;

// Typed as Record<LocaleKey, string> so a key missing from zh.json is a compile error.
const locales: Record<Language, Record<LocaleKey, string>> = { en, zh };

let current: Language = 'en';

export function setLanguage(lang: Language): void {
  current = lang;
}

export function t(key: LocaleKey, vars?: Record<string, string | number>): string {
  let s = locales[current][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

// Every language's value for a key — parsing must recognize notes written
// under any language setting, not just the current one.
export function variants(key: LocaleKey): string[] {
  return (Object.keys(locales) as Language[]).map((l) => locales[l][key]);
}
