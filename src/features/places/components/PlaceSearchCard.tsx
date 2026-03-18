import type { Place } from "../api/client";

interface PlaceSearchCardProps {
  place: Place;
}

export function PlaceSearchCard({ place }: PlaceSearchCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {place.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {place.district ?? "구 정보 없음"}
        </p>
      </div>
    </div>
  );
}
