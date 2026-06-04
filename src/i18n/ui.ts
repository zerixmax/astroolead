import hr from '../data/i18n/hr.json';
import en from '../data/i18n/en.json';

export const languages = {
  hr: 'Hrvatski',
  en: 'English',
} as const;

export const defaultLang = 'hr';

export const ui = {
  hr,
  en,
} as const;

export type Lang = keyof typeof ui;

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Prev = [never, 0, 1, 2, 3, 4, ...Array<never>];

type Leaves<T, D extends number = 5> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T] : "";

export type TranslationKey = Leaves<typeof hr>;

export function useTranslations(lang: Lang) {
  const translations = ui[lang] || ui[defaultLang];

  return function t(key: TranslationKey): string {
    const parts = key.split('.');
    let current: any = translations;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return key;
      }
    }
    return typeof current === 'string' ? current : key;
  };
}
