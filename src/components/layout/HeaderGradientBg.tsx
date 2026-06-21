import ProgressiveBlur from "./ProgressiveBlur";

export default function HeaderGradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-20 w-full">
      <ProgressiveBlur
        className="h-full w-full"
        position="top"
        intensity={40}
      />
    </div>
  );
}
