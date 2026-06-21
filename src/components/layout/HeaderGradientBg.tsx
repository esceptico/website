import ProgressiveBlur from "./ProgressiveBlur";

// Matches ~/src/ntrp/apps/desktop ScrollBlurTop: strong progressive blur paired
// with a subtle color veil so content reads as cleanly dissolving under the nav
// rather than floating as blurred text.
export default function HeaderGradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-24 w-full">
      <ProgressiveBlur
        className="h-full w-full bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--theme-bg-primary)_68%,transparent),color-mix(in_oklab,var(--theme-bg-primary)_22%,transparent)_58%,transparent)]"
        position="top"
        intensity={72}
      />
    </div>
  );
}
