// Hand-drawn-feeling SVG marks. Inline paths, no deps.
// Used as small watermarks per cluster, plus an underline for hero,
// and a dot mark for the "weighs" toggle.
import * as React from "react";

type MarkProps = React.SVGProps<SVGSVGElement>;

const base = (props: MarkProps): MarkProps => ({
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

export const ShoeMark = (props: MarkProps) => (
  <svg {...base(props)}>
    <path d="M8 38 C 12 30, 22 28, 30 30 L 44 36 C 50 38, 56 38, 56 44 L 56 48 L 10 48 C 8 48, 7 46, 8 44 Z" />
    <path d="M22 32 L 24 38 M30 33 L 32 39 M38 35 L 40 41" />
  </svg>
);

export const CalendarMark = (props: MarkProps) => (
  <svg {...base(props)}>
    <rect x="10" y="14" width="44" height="38" rx="2" />
    <path d="M10 24 L 54 24" />
    <path d="M20 10 L 20 18 M44 10 L 44 18" />
    <path d="M22 38 L 30 46 M30 38 L 22 46" />
  </svg>
);

export const StethoscopeMark = (props: MarkProps) => (
  <svg {...base(props)}>
    <path d="M18 10 L 18 28 C 18 36, 26 40, 32 40 C 38 40, 46 36, 46 28 L 46 10" />
    <path d="M14 10 L 22 10 M42 10 L 50 10" />
    <circle cx="32" cy="50" r="5" />
    <path d="M32 40 L 32 45" />
  </svg>
);

export const GiftMark = (props: MarkProps) => (
  <svg {...base(props)}>
    <rect x="10" y="22" width="44" height="30" rx="1" />
    <path d="M8 22 L 56 22 L 56 30 L 8 30 Z" />
    <path d="M32 22 L 32 52" />
    <path d="M22 22 C 22 16, 28 12, 32 16 C 36 12, 42 16, 42 22" />
  </svg>
);

export const CupMark = (props: MarkProps) => (
  <svg {...base(props)}>
    <path d="M14 22 L 14 44 C 14 50, 18 54, 24 54 L 38 54 C 44 54, 48 50, 48 44 L 48 22 Z" />
    <path d="M48 28 C 56 28, 56 40, 48 40" />
    <path d="M22 12 C 22 16, 24 16, 24 20 M30 12 C 30 16, 32 16, 32 20" />
  </svg>
);

export const Underline = (props: MarkProps) => (
  <svg
    viewBox="0 0 200 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    {...props}
  >
    <path d="M4 8 C 40 2, 90 12, 140 5 C 170 1, 188 9, 196 6" />
  </svg>
);

export const DotMark = (props: MarkProps) => (
  <svg {...base(props)}>
    <path d="M28 22 C 36 18, 44 24, 42 32 C 40 40, 28 42, 24 36 C 20 30, 22 26, 28 22 Z" />
    <path d="M30 30 L 34 30" />
  </svg>
);

export function ClusterMark({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  switch (category) {
    case "school_comm":
      return <CalendarMark className={className} />;
    case "deadlines_prep":
      return <ShoeMark className={className} />;
    case "appointments":
      return <StethoscopeMark className={className} />;
    case "social_obligations":
      return <GiftMark className={className} />;
    case "daily_logistics":
      return <CupMark className={className} />;
    default:
      return <DotMark className={className} />;
  }
}
