export function Decay({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        backgroundImage: 'linear-gradient(90deg, currentColor 0%, transparent 140%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  );
}
