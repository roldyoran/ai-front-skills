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
 * Detect locale from URL path
 */
export function getLocaleFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/')[1];
  if (firstSegment === 'es') return 'es';
  return defaultLocale;
}

/**
 * Get alternate locale URL
 */
export function getAlternateLocaleUrl(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale === 'es') {
    // Remove /es prefix
    return pathname.replace('/es', '') || '/';
  }
  // Add /es prefix
  return `/es${pathname}`;
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
