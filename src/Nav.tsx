import { COPY, type Lang } from './content/copy';

// The restrained navigation (DL63): absolute over the hero only — it
// scrolls away with Act 0, so it never fights the espresso act for
// contrast and never sits above the traveling dot. Logotype is plain
// espresso text (DL27: no wordmark asset yet; and a saffron period here
// would be a second dot — banned). The FR/EN pair is the D2 toggle
// (DL64). No download pill here — the hero CTA cluster (DL67) owns that
// intent; two identical saffron pills in one viewport read as a mistake.
// Anchor hrefs work pre-hydration; App upgrades clicks to Lenis scrolls.
// Identical markup lives in the index.html shell — lockstep.
export function Nav({
  lang,
  onLangChange,
  onNavigate,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const copy = COPY[lang];
  const langButton = (l: Lang) => (
    <button
      type="button"
      aria-pressed={lang === l}
      onClick={() => onLangChange(l)}
      className={`px-1 py-2 font-sans text-sm uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary ${
        lang === l ? 'font-sans-semibold text-content-primary' : 'text-content-secondary'
      }`}
    >
      {l.toUpperCase()}
    </button>
  );

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav aria-label="Navigation" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <a
          href="#act-0"
          onClick={onNavigate}
          className="font-display-small text-2xl text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
        >
          Mishi
        </a>
        <div className="flex items-center gap-5 md:gap-7">
          <a
            href="#act-2"
            onClick={onNavigate}
            className="hidden font-sans text-sm text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary md:block"
          >
            {copy.navHow}
          </a>
          <a
            href="#act-3"
            onClick={onNavigate}
            className="hidden font-sans text-sm text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary md:block"
          >
            {copy.navWhy}
          </a>
          <span className="flex items-center gap-0.5" role="group" aria-label="Langue">
            {langButton('fr')}
            <span aria-hidden="true" className="text-content-tertiary">
              /
            </span>
            {langButton('en')}
          </span>
        </div>
      </nav>
    </header>
  );
}
