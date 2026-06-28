import { useTheme } from "../context/ThemeContext";

export default function AuthBackground() {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const lineColor = isDark ? "#6366f1" : "#4f46e5";
  const lineOpacity = isDark ? 0.18 : 0.1;
  const shapeOpacity = isDark ? 0.25 : 0.15;
  const blobColor = isDark ? "#6366f1" : "#4f46e5";
  const blobOpacity = isDark ? 0.1 : 0.05;
  const dotColor = isDark ? "#818cf8" : "#4f46e5";
  const dotOpacity = isDark ? 0.25 : 0.15;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 680 440"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Diagonal lines */}
      <g stroke={lineColor} strokeWidth="1" fill="none" opacity={lineOpacity}>
        <line x1="0" y1="80" x2="680" y2="40" />
        <line x1="0" y1="160" x2="680" y2="120" />
        <line x1="0" y1="300" x2="680" y2="360" />
        <line x1="0" y1="380" x2="680" y2="440" />
      </g>

      {/* Outlined shapes */}
      <g
        stroke={lineColor}
        strokeWidth="1.5"
        fill="none"
        opacity={shapeOpacity}
      >
        <circle cx="120" cy="110" r="70" />
        <circle cx="120" cy="110" r="48" />
        <rect
          x="500"
          y="60"
          width="110"
          height="110"
          rx="10"
          transform="rotate(15 555 115)"
        />
        <polygon points="560,330 620,370 540,400" />
        <rect
          x="80"
          y="320"
          width="80"
          height="80"
          rx="8"
          transform="rotate(-12 120 360)"
        />
      </g>

      {/* Soft filled blobs */}
      <g fill={blobColor} opacity={blobOpacity}>
        <circle cx="340" cy="220" r="90" />
        <circle cx="610" cy="250" r="40" />
      </g>

      {/* Accent dots */}
      <g fill={dotColor} opacity={dotOpacity}>
        <circle cx="250" cy="90" r="3" />
        <circle cx="430" cy="150" r="3" />
        <circle cx="200" cy="380" r="3" />
        <circle cx="470" cy="330" r="3" />
        <circle cx="640" cy="140" r="3" />
      </g>
    </svg>
  );
}
