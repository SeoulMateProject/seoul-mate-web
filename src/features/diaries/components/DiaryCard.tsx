"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { DiaryWithLikeScrap } from "../api/types";
import { toggleDiaryLike, toggleDiaryScrap } from "../api/client";

interface DiaryCardProps {
  diary: DiaryWithLikeScrap;
}

export function DiaryCard({ diary }: DiaryCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(diary.liked);
  const [likeCount, setLikeCount] = useState(diary.likeCount);
  const [scrapped, setScrapped] = useState(diary.scrapped);

  const [likeLoading, setLikeLoading] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);

  useEffect(() => {
    setLiked(diary.liked);
    setLikeCount(diary.likeCount);
    setScrapped(diary.scrapped);
  }, [diary.id, diary.liked, diary.likeCount, diary.scrapped]);

  const heartSrc = liked ? "/icons/heart-active.svg" : "/icons/heart.svg";
  const scrapSrc = scrapped ? "/icons/diary-active.svg" : "/icons/diary.svg";

  const handleToggleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await toggleDiaryLike(diary.id);
      setLiked(res.liked);
      if (typeof res.likeCount === "number" && res.likeCount !== null) {
        setLikeCount(res.likeCount);
      } else {
        setLikeCount((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleScrap = async () => {
    if (scrapLoading) return;
    setScrapLoading(true);
    try {
      const res = await toggleDiaryScrap(diary.id);
      setScrapped(res.scrapped);
    } catch (e) {
      console.error(e);
    } finally {
      setScrapLoading(false);
    }
  };

  const preview = diary.content.trim().slice(0, 120);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/diaries/${diary.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(`/diaries/${diary.id}`);
      }}
      className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
      aria-label={`일기 상세 보기: ${diary.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {diary.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {preview || "내용 없음"}
          </p>
          <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
            {new Date(diary.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLike();
            }}
            disabled={likeLoading}
            className="flex items-center gap-1 rounded-xl bg-zinc-50 px-2 py-1 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:ring-zinc-800"
            aria-label="일기 좋아요 토글"
          >
            <Image src={heartSrc} alt="좋아요" width={16} height={16} />
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              {likeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleScrap();
            }}
            disabled={scrapLoading}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:ring-zinc-800"
            aria-label="일기 스크랩 토글"
          >
            <Image src={scrapSrc} alt="스크랩" width={18} height={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
