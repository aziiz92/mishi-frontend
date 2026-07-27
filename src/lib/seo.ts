import type { Lang } from '../content/copy';
import { landingConfig } from '../landing.config';

const META = {
  fr: {
    title: 'Mishi | Une photo. Une recommandation.',
    description: 'Photographie un menu, comprends chaque plat et reçois une recommandation adaptée à tes goûts en moins de 60 secondes.',
    locale: 'fr_SN',
  },
  en: {
    title: 'Mishi | One photo. One recommendation.',
    description: 'Photograph a menu, understand every dish, and get a recommendation shaped around your tastes in under 60 seconds.',
    locale: 'en_US',
  },
} as const;

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

function setLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang ? `link[rel="${rel}"][hreflang="${hrefLang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  const element = document.querySelector<HTMLLinkElement>(selector);
  if (element) element.href = href;
}

export function applySeo(lang: Lang): void {
  const meta = META[lang];
  const canonical = `${landingConfig.canonicalBaseUrl}/${lang}/`;
  document.title = meta.title;

  setMeta('meta[name="description"]', 'content', meta.description);
  setMeta('meta[property="og:locale"]', 'content', meta.locale);
  setMeta('meta[property="og:title"]', 'content', meta.title);
  setMeta('meta[property="og:description"]', 'content', meta.description);
  setMeta('meta[property="og:url"]', 'content', canonical);
  setMeta('meta[name="twitter:title"]', 'content', meta.title);
  setMeta('meta[name="twitter:description"]', 'content', meta.description);
  setLink('canonical', canonical);
  setLink('alternate', `${landingConfig.canonicalBaseUrl}/fr/`, 'fr');
  setLink('alternate', `${landingConfig.canonicalBaseUrl}/en/`, 'en');

  const structured = document.getElementById('mishi-structured-data');
  if (structured) {
    structured.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Mishi',
          url: landingConfig.canonicalBaseUrl,
          inLanguage: ['fr', 'en'],
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Mishi',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'iOS',
          url: canonical,
          description: meta.description,
        },
      ],
    });
  }
}
