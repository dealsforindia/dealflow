import React from "react";

interface FeatherLogoProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * High-precision vector recreation of the Robinhood stylized feather emblem.
 * Features the signature angled quill vane, tapered tip, and clean inner barb split.
 */
export const FeatherLogo: React.FC<FeatherLogoProps> = ({
  size = 120,
  color = "#000000",
  className,
  style,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      {/* Robinhood Feather: smooth curved outer quill with crisp split barb notch */}
      <path
        d="M 52 10 
           C 66 22, 78 40, 75 58 
           C 73 70, 65 79, 56 86 
           C 53 88, 51 90, 50 92 
           C 49 90, 48 87, 48 83 
           C 48 76, 52 70, 54 63 
           C 56 57, 56 50, 53 44 
           L 50 49 
           C 46 56, 42 63, 38 71 
           C 34 78, 30 84, 27 88 
           C 25 81, 26 73, 29 65 
           C 33 54, 40 43, 47 32 
           C 50 27, 53 20, 52 10 Z"
        fill={color}
      />
      {/* Subtle quill stem accent */}
      <path
        d="M 50 92 L 49 96"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
