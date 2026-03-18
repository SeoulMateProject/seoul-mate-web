import type { PlaceWithLike } from "../api/client";
import { PlaceSearchCard } from "./PlaceSearchCard";

interface PlaceSearchListProps {
  items: PlaceWithLike[];
}

export function PlaceSearchList({ items }: PlaceSearchListProps) {
  return (
    <div className="space-y-3">
      {items.map((place) => (
        <PlaceSearchCard key={place.id} place={place} />
      ))}
    </div>
  );
}
