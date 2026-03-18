"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { togglePlaceLike } from "../api/client";
import type { PlaceWithLike } from "../api/client";

interface PlaceSearchCardProps {
  place: PlaceWithLike;
}

export function PlaceSearchCard({ place }: PlaceSearchCardProps) {
  const [liked, setLiked] = useState(place.liked);
  const [likeCount, setLikeCount] = useState(place.likeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(place.liked);
    setLikeCount(place.likeCount);
  }, [place.id, place.liked, place.likeCount]);

  const heartSrc = liked ? "/icons/heart-active.svg" : "/icons/heart.svg";

  const handleToggleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await togglePlaceLike(place.id);
      setLiked(res.liked);
      setLikeCount((prev) => {
        if (res.liked) return prev + 1;
        return Math.max(0, prev - 1);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

      <button
        type="button"
        onClick={handleToggleLike}
        disabled={loading}
        className="flex items-center gap-1 rounded-xl bg-zinc-50 px-2 py-1 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:ring-zinc-800"
        aria-label="장소 좋아요 토글"
      >
        <Image src={heartSrc} alt="좋아요" width={16} height={16} className="opacity-90" />
        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{likeCount}</span>
      </button>
    </div>
  );
}
