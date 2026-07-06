"use client";

export function AnnouncementTicker({
  texts,
  bgColor,
  textColor,
}: {
  texts: string[];
  bgColor: string;
  textColor: string;
}) {
  if (!texts.length) return null;

  // Join with a visible separator; duplicate for seamless loop
  const combined = texts.join("   ·   ");
  // Speed: ~80px/s feels natural; estimate based on character count
  const duration = Math.max(12, combined.length * 0.18);

  return (
    <div
      className="overflow-hidden py-2 select-none"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <p
        className="animate-ticker whitespace-nowrap text-sm font-medium"
        style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
      >
        {combined}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{combined}
      </p>
    </div>
  );
}
