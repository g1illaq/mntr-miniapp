export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="mntr comm">
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="7" />
      <circle cx="50"   cy="12" r="10" fill="currentColor" />
      <circle cx="82.9" cy="69" r="10" fill="currentColor" />
      <circle cx="17.1" cy="69" r="10" fill="currentColor" />
    </svg>
  );
}
