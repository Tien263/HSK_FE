import Image from "next/image";

export default function BrandMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/app-icon-192.png?v=nj"
      alt=""
      width={size}
      height={size}
      draggable={false}
      unoptimized
      className={`block shrink-0 rounded-[22%] border border-[#dedfc8] bg-white object-contain ${className}`}
    />
  );
}
