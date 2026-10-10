import es from '@/data/i18n/es.json';
import en from '@/data/i18n/en.json';

export type Locale = 'es' | 'en';
export type TranslationKey = string;

const translations: Record<Locale, typeof es> = {
  es,
  en,
};

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'es'];

/**
 * Display labels per locale. Add a new entry here when adding a language —
 * the language toggle in the header renders from this map automatically
 * (short code visible, full label as tooltip).
 */
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

/**
 * Detect locale from URL path
 */
export function getLocaleFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/')[1];
  if (firstSegment && (locales as string[]).includes(firstSegment)) {
    return firstSegment as Locale;
  }
  return defaultLocale;
}

/**
 * Build the URL of the same page in another locale.
 * Works for any current/future locale: strips a leading locale prefix
 * (when it is not the default locale) and prepends the target one.
 */
export function getLocaleUrl(pathname: string, target: Locale): string {
  const segments = pathname.split('/');
  if (segments[1] && (locales as string[]).includes(segments[1]) && segments[1] !== defaultLocale) {
    segments.splice(1, 1);
  }
  const clean = segments.join('/') || '/';
  return target === defaultLocale ? clean : `/${target}${clean === '/' ? '' : clean}`;
}

/**
 * Get alternate locale URL
 */
export function getAlternateLocaleUrl(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  const other: Locale = locale === 'es' ? 'en' : 'es';
  return getLocaleUrl(pathname, other);
}

/**
 * Get locale prefix for URLs
 */
export function getLocalePrefix(locale: Locale): string {
  return locale === 'es' ? '/es' : '';
}

/**
 * Get a nested translation key
 */
export function t(key: TranslationKey, locale: Locale = defaultLocale): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to default locale
      value = translations[defaultLocale];
      for (const fk of keys) {
        if (value && typeof value === 'object' && fk in value) {
          value = value[fk];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Get all translations for a locale
 */
export function getTranslations(locale: Locale): typeof es {
  return translations[locale];
}
