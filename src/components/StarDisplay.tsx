export function StarDisplay({
  avgRating,
  ratingCount,
  size = "sm",
}: {
  avgRating: number | null;
  ratingCount: number;
  size?: "sm" | "xs";
}) {
  if (!avgRating || ratingCount === 0) return null;

  const textSize = size === "xs" ? "text-xs" : "text-sm";
  const starSize = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${textSize} text-stone-500`}>
      <span className={`${starSize} text-amber-400`}>★</span>
      <span className="font-medium text-stone-700">{avgRating.toFixed(1)}</span>
      <span className="text-stone-400">({ratingCount})</span>
    </div>
  );
}
