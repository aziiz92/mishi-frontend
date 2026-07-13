// Invisible geometry the dot path measures. The hesitation anchors
// (chaos-1/2/3, dot/path.ts) must NOT ride the 3D-animated panels:
// compileDotPath measures document-space rects once, at rest, and a
// transformed panel measures somewhere its dishes never visually are
// (DL60). Each target sits where the labyrinth places a dish line at the
// scroll offset of its keyframe.
export function DotTarget({ anchor, className }: { anchor: string; className: string }) {
  return <span data-dot-anchor={anchor} aria-hidden="true" className={`absolute h-6 w-56 ${className}`} />;
}
