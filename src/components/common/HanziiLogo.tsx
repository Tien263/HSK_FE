"use client";

import React from "react";

interface HanziiLogoProps {
  /** The Chinese character to display */
  char: string;
  /** Additional Tailwind classes for custom styling */
  className?: string;
}

/**
 * Simple inline component that renders a Chinese character using the same
 * styling as the original UI. This acts as the "hanzii" visual element the
 * user requested. It can be swapped in place of raw <span> elements.
 */
export default function HanziiLogo({ char, className }: HanziiLogoProps) {
  return (
    <span
      className={`inline-block text-7xl font-serif font-bold text-[#204434]/85 select-none ${className}`}
    >
      {char}
    </span>
  );
}
