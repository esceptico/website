interface VideoProps {
  src: string;
  caption?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export function Video({ src, caption, autoPlay = true, loop = true, muted = true }: VideoProps) {
  return (
    <figure className="my-6">
      <video
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls
        playsInline
        className="w-full h-auto block"
      />
      {caption && (
        <figcaption className="mt-2 px-1">
          <span className="font-mono text-[11px] text-[var(--theme-text-muted)] leading-relaxed">
            {caption}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
