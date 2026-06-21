type BlurPosition = "top" | "bottom" | "left" | "right";

interface ProgressiveBlurProps {
  className?: string;
  intensity?: number;
  position?: BlurPosition;
}

const positionClasses: Record<BlurPosition, string> = {
  bottom: "bottom-0 left-0 right-0",
  top: "top-0 left-0 right-0",
  left: "left-0 top-0 bottom-0",
  right: "right-0 top-0 bottom-0",
};

const gradientDirection: Record<BlurPosition, string> = {
  bottom: "to bottom",
  top: "to top",
  left: "to left",
  right: "to right",
};

export default function ProgressiveBlur({
  className = "",
  intensity = 50,
  position = "top",
}: ProgressiveBlurProps) {
  const intensityFactor = intensity / 50;
  const blurLayers = [
    { blur: `${1 * intensityFactor}px`, maskStart: 0, maskEnd: 25, zIndex: 1 },
    { blur: `${3 * intensityFactor}px`, maskStart: 25, maskEnd: 75, zIndex: 2 },
    { blur: `${6 * intensityFactor}px`, maskStart: 75, maskEnd: 100, zIndex: 3 },
  ];

  return (
    <div className={`absolute ${positionClasses[position]} z-10 ${className}`}>
      {blurLayers.map((layer, index) => (
        <div
          key={index}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: layer.zIndex,
            backdropFilter: `blur(${layer.blur})`,
            WebkitBackdropFilter: `blur(${layer.blur})`,
            maskImage: `linear-gradient(${gradientDirection[position]}, transparent ${layer.maskStart}%, black ${layer.maskEnd}%)`,
            WebkitMaskImage: `linear-gradient(${gradientDirection[position]}, transparent ${layer.maskStart}%, black ${layer.maskEnd}%)`,
          }}
        />
      ))}
    </div>
  );
}
