interface Props {
  width: number;
  height: number;
  chevronColor: string;
  ballColor: string;
  seamColor: string;
}

/** El isotipo SVG por default de Home Pádel (cuando no hay imagen personalizada). */
export default function BrandLogoMark({ width, height, chevronColor, ballColor, seamColor }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 92 58"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 54 L41 24 L75 54"
        stroke={chevronColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <line
        x1="52" y1="31"
        x2="77" y2="12"
        stroke={chevronColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <circle cx="83" cy="10" r="9" fill={ballColor} />

      <path
        d="M75.5 7 Q80 10.5 75.5 14"
        stroke={seamColor}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M90.5 7 Q86 10.5 90.5 14"
        stroke={seamColor}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
