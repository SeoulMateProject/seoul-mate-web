import Image from "next/image";
import type { TrendingPlace } from "../api/client";

interface PlaceTrendingCardProps {
  place: TrendingPlace;
}

export function PlaceTrendingCard({ place }: PlaceTrendingCardProps) {
  const heartSrc = place.liked ? "/icons/heart-active.svg" : "/icons/heart.svg";

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {place.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{place.district ?? ""}</p>
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-zinc-50 px-2 py-1 ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
        <Image src={heartSrc} alt="좋아요" width={16} height={16} className="opacity-90" />
        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
          {place.likeCount}
        </span>
      </div>
    </div>
  );
}
