"use client";

import { useEffect, useState } from "react";
import type { DiaryWithLikeScrap } from "@/features/diaries/api/types";
import { DiaryCard } from "@/features/diaries/components/DiaryCard";
import { fetchMyDiaries } from "../api/client";

export function MyDiaryList() {
  const [items, setItems] = useState<DiaryWithLikeScrap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchMyDiaries({ limit: 20 });
        if (cancelled) return;
        setItems(res.items);
      } catch {
        if (cancelled) return;
        setError("내 일기를 불러오지 못했어요.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="py-10 text-center text-sm text-zinc-500">로딩 중...</p>;
  if (error) return <p className="py-10 text-center text-sm text-red-500">{error}</p>;
  if (items.length === 0)
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        작성한 일기가 없어요.
      </p>
    );

  return (
    <div className="space-y-3">
      {items.map((diary) => (
        <DiaryCard key={diary.id} diary={diary} />
      ))}
    </div>
  );
}
