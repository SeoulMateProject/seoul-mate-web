"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TrendingPlace } from "../api/client";
import { togglePlaceLike } from "../api/client";

interface PlaceTrendingCardProps {
  place: TrendingPlace;
}

export function PlaceTrendingCard({ place }: PlaceTrendingCardProps) {
  const router = useRouter();
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
      // 인증이 필요한 경우가 대부분이므로 UI는 조용히 실패 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/places/${place.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(`/places/${place.id}`);
      }}
      className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/60"
      aria-label={`장소 상세 보기: ${place.name}`}
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {place.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{place.district ?? ""}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleLike();
        }}
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
