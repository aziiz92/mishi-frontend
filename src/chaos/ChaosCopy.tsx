// Act 1's held line — the one thing that stands still while the labyrinth
// closes in. Three lines, revealed in step with the pressure beats.
// Copy verbatim from docs/mishi-landing-concept.md — guarded by check:copy
// (DL58). Do not paraphrase.
const LINES = ['14 plats.', 'Aucune photo.', 'Le serveur attend.'] as const;

export function ChaosCopy({ isStatic }: { isStatic: boolean }) {
  return (
    <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <span className="bg-surface-canvas/85 px-6 py-4 text-center font-display-title text-2xl text-content-primary md:text-3xl">
        {LINES.map((line) => (
          <span key={line} data-chaos-copy-line className={`block ${isStatic ? '' : 'opacity-0'}`}>
            {line}
          </span>
        ))}
      </span>
    </p>
  );
}
