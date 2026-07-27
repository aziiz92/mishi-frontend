import { useEffect, useState } from 'react';

import { COPY, type Lang } from './content/copy';
import { Footer } from './components/Footer';
import { applyLang, initialLang, localizedHome } from './lib/lang';

export function AboutPage() {
  const [lang] = useState<Lang>(initialLang);
  const copy = COPY[lang].about;

  useEffect(() => {
    applyLang(lang);
    document.title = `${lang === 'fr' ? 'À propos' : 'About'} | Mishi`;
  }, [lang]);

  return (
    <main className="min-h-screen bg-surface-canvas">
      <article className="px-6 pb-24 pt-8 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-6xl">
          <a href={localizedHome(lang)} className="font-display-small text-3xl text-content-primary">Mishi</a>
          <div className="mt-24 max-w-4xl sm:mt-36">
            <p className="section-eyebrow">{copy.eyebrow}</p>
            <h1 className="mt-5 font-display-title text-5xl leading-[1.02] text-content-primary sm:text-7xl">{copy.title}</h1>
            <div className="mt-10 grid gap-7 font-sans text-lg leading-8 text-content-secondary md:grid-cols-2 md:gap-12">
              <p>{copy.body}</p>
              <p>{copy.second}</p>
            </div>
            <a href={localizedHome(lang)} className="mt-12 inline-flex min-h-11 items-center rounded-full bg-content-primary px-6 font-sans-semibold text-content-inverse">
              {copy.back}
            </a>
          </div>
        </div>
      </article>
      <Footer lang={lang} />
    </main>
  );
}
