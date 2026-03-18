"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { PlaceWithLike } from "@/features/places/api/client";
import { fetchLikedPlaces } from "../api/client";
import { togglePlaceLike } from "@/features/places/api/client";

export function LikedPlaceList() {
  const router = useRouter();
  const [items, setItems] = useState<PlaceWithLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLikedPlaces({ limit: 20 });
        if (cancelled) return;
        setItems(res.items);
      } catch {
        if (cancelled) return;
        setError("좋아요한 장소를 불러오지 못했어요.");
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

  const handleToggleLike = async (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    try {
      const res = await togglePlaceLike(placeId);
      setItems((prev) =>
        res.liked
          ? prev.map((p) => (p.id === placeId ? { ...p, liked: true } : p))
          : prev.filter((p) => p.id !== placeId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="py-10 text-center text-sm text-zinc-500">로딩 중...</p>;
  if (error) return <p className="py-10 text-center text-sm text-red-500">{error}</p>;
  if (items.length === 0)
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        좋아요한 장소가 없어요.
      </p>
    );

  return (
    <div className="space-y-3">
      {items.map((place) => (
        <div
          key={place.id}
          role="link"
          tabIndex={0}
          onClick={() => router.push(`/places/${place.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") router.push(`/places/${place.id}`);
          }}
          className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60"
          aria-label={`장소 상세: ${place.name}`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {place.name}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {place.district ?? "구 정보 없음"}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => handleToggleLike(e, place.id)}
            className="flex items-center gap-1 rounded-xl bg-zinc-50 px-2 py-1 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 dark:bg-zinc-950 dark:ring-zinc-800"
            aria-label="좋아요 토글"
          >
            <Image
              src={place.liked ? "/icons/heart-active.svg" : "/icons/heart.svg"}
              alt="좋아요"
              width={16}
              height={16}
            />
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              {place.likeCount}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
