"use client";

import type { DiaryWithLikeScrap } from "../api/types";
import { DiaryCard } from "./DiaryCard";

interface DiaryListProps {
  items: DiaryWithLikeScrap[];
}

export function DiaryList({ items }: DiaryListProps) {
  return (
    <div className="space-y-3">
      {items.map((d) => (
        <DiaryCard key={d.id} diary={d} />
      ))}
    </div>
  );
}
