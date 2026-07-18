import { COPY, type Lang } from '../content/copy';

// Act 1's held line — the one thing that stands still while the labyrinth
// closes in. Three lines, revealed in step with the pressure beats.
// Copy lives in src/content/copy.ts, verbatim from
// docs/mishi-landing-concept.md — guarded by check:copy (DL58). Do not
// paraphrase.
export function ChaosCopy({ isStatic, lang }: { isStatic: boolean; lang: Lang }) {
  return (
    <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      {/* the cream backing rides each LINE (not the container): an empty
          translucent box must never float before the first reveal */}
      <span className="text-center font-display-title text-2xl text-content-primary md:text-3xl">
        {COPY[lang].chaosLines.map((line) => (
          <span key={line} data-chaos-copy-line className={`block bg-surface-canvas/85 px-6 py-1 ${isStatic ? '' : 'opacity-0'}`}>
            {line}
          </span>
        ))}
      </span>
    </p>
  );
}
