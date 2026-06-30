import Image from "next/image";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="mntr comm"
      width={size}
      height={size}
      className="rounded-lg"
      priority
    />
  );
}
