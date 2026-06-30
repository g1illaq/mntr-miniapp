export function Logo({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="mntr comm"
      width={size}
      height={size}
      style={{ borderRadius: 8, objectFit: "contain" }}
    />
  );
}
