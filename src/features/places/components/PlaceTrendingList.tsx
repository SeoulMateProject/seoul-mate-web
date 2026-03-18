import type { TrendingPlace } from "../api/client";
import { PlaceTrendingCard } from "./PlaceTrendingCard";

interface PlaceTrendingListProps {
  items: TrendingPlace[];
}

export function PlaceTrendingList({ items }: PlaceTrendingListProps) {
  return (
    <div className="space-y-3">
      {items.map((place) => (
        <PlaceTrendingCard key={place.id} place={place} />
      ))}
    </div>
  );
}
