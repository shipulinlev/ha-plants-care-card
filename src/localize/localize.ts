import en from './en.json';

type Entry = string | (Partial<Record<Intl.LDMLPluralRule, string>> & { other: string });
type Dictionary = Record<string, Entry>;

export type TranslationKey = keyof typeof en;
export interface LocalizeVars {
  n?: number;
  date?: string;
  name?: string;
  label?: string;
}
export type Localize = (key: TranslationKey, vars?: LocalizeVars) => string;

// Add a language by adding its JSON here; missing keys fall back to English.
const LANGUAGES: Record<string, Dictionary> = { en };

const baseLanguage = (language: string) => language.toLowerCase().split(/[-_]/)[0];

export function createLocalize(language: string): Localize {
  const lang = LANGUAGES[baseLanguage(language)] ? baseLanguage(language) : 'en';
  const dict = LANGUAGES[lang];
  const plurals = new Intl.PluralRules(lang);
  return (key, vars = {}) => {
    const entry = dict[key] ?? (en as Dictionary)[key] ?? key;
    const template =
      typeof entry === 'string' ? entry : (entry[plurals.select(vars.n ?? 0)] ?? entry.other);
    return template.replace(/\{(n|date|name|label)\}/g, (_, v: keyof LocalizeVars) =>
      String(vars[v] ?? ''),
    );
  };
}

// Short weekday, day and month ("Thu 15 Oct"). Plain English uses the en-GB order from the design.
export function formatShortDate(date: Date, language: string, timeZone: string): string {
  const locale = baseLanguage(language) === 'en' && !language.includes('-') ? 'en-GB' : language;
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(date);
}
