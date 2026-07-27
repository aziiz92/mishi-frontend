import type { Lang } from '../content/copy';
import { landingConfig } from '../landing.config';
import { track, type CtaId } from '../lib/analytics';

export function AppStoreCta({
  lang,
  cta,
  compact = false,
  className = '',
}: {
  lang: Lang;
  cta: CtaId;
  compact?: boolean;
  className?: string;
}) {
  const label = lang === 'fr' ? 'Télécharger dans l’App Store' : 'Download on the App Store';
  const compactLabel = lang === 'fr' ? 'Télécharger' : 'Download';

  return (
    <a
      href={landingConfig.campaignLinks[lang]}
      data-cta={cta}
      onClick={() => track({ event_name: 'landing_cta_tapped', cta })}
      aria-label={label}
      className={`${compact ? 'inline-flex min-h-11 items-center rounded-full bg-content-primary px-5 font-sans-semibold text-sm text-content-inverse' : 'inline-flex h-[60px] w-[180px] shrink-0 items-center'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary ${className}`}
    >
      {!compact ? (
        <img
          src={landingConfig.badgeSources[lang]}
          alt={label}
          width="180"
          height="60"
          className="h-[60px] w-[180px]"
        />
      ) : (
        <span>{compactLabel}</span>
      )}
    </a>
  );
}
