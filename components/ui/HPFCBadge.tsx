import Image from 'next/image';

export function HPFCBadge({ className }: { className?: string }) {
  return (
    <Image
      src="/hpfc-badge.png"
      alt="Hinksey Park FC Badge"
      width={400}
      height={500}
      className={className}
      priority
    />
  );
}
