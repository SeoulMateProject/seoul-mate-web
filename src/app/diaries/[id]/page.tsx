"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import type { DiaryWithLikeScrap } from "@/features/diaries/api/types";
import {
  fetchDiaryById,
  toggleDiaryLike,
  toggleDiaryScrap,
  deleteDiary,
  fetchRelatedDiaries,
} from "@/features/diaries/api/client";
import { DiaryCard } from "@/features/diaries/components/DiaryCard";

export default function DiaryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const diaryId = useMemo(() => {
    if (!params?.id) return null;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [diary, setDiary] = useState<DiaryWithLikeScrap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [related, setRelated] = useState<DiaryWithLikeScrap[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (!diaryId) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDiaryById(diaryId);
        if (cancelled) return;
        setDiary(data);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("일기 정보를 불러오지 못했어요.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [diaryId]);

  useEffect(() => {
    if (!diaryId) return;

    let cancelled = false;

    async function run() {
      setRelatedLoading(true);
      try {
        const res = await fetchRelatedDiaries(diaryId, { limit: 5, offset: 0 });
        if (cancelled) return;
        setRelated(res.items);
      } catch {
        if (cancelled) return;
        setRelated([]);
      } finally {
        if (cancelled) return;
        setRelatedLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [diaryId]);

  const handleToggleLike = async () => {
    if (!diary) return;
    try {
      const res = await toggleDiaryLike(diary.id);
      setDiary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          liked: res.liked,
          likeCount:
            typeof res.likeCount === "number"
              ? res.likeCount
              : res.liked
                ? prev.likeCount + 1
                : Math.max(0, prev.likeCount - 1),
        };
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleScrap = async () => {
    if (!diary) return;
    try {
      const res = await toggleDiaryScrap(diary.id);
      setDiary((prev) => (prev ? { ...prev, scrapped: res.scrapped } : prev));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = () => {
    if (!diary) return;
    router.push(`/diaries/${diary.id}/edit`);
  };

  const handleDelete = async () => {
    if (!diary) return;
    if (!window.confirm("일기를 삭제할까요?")) return;

    try {
      await deleteDiary(diary.id);
      router.replace("/diaries");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했어요. 다시 시도해주세요.");
    }
  };

  const heartSrc = diary && diary.liked ? "/icons/heart-active.svg" : "/icons/heart.svg";
  const scrapSrc = diary && diary.scrapped ? "/icons/diary-active.svg" : "/icons/diary.svg";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-white px-3 py-1.5 text-sm ring-1 ring-zinc-100 hover:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            뒤로
          </button>
          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">일기 상세</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-zinc-100 hover:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 ring-1 ring-red-100 hover:bg-red-100 dark:bg-red-950/30 dark:ring-red-900/40"
            >
              삭제
            </button>
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-zinc-500">로딩 중...</p>
        ) : error ? (
          <p className="py-6 text-center text-sm text-red-500">{error}</p>
        ) : diary ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {diary.title}
                  </h1>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(diary.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    className="flex items-center gap-1 rounded-xl bg-zinc-50 px-2 py-1 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 dark:bg-zinc-950 dark:ring-zinc-800"
                    aria-label="일기 좋아요 토글"
                  >
                    <Image src={heartSrc} alt="좋아요" width={18} height={18} />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                      {diary.likeCount ?? 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleScrap}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 dark:bg-zinc-950 dark:ring-zinc-800"
                    aria-label="일기 스크랩 토글"
                  >
                    <Image src={scrapSrc} alt="스크랩" width={20} height={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap wrap-break-word text-sm text-zinc-800 dark:text-zinc-200">
                {diary.content}
              </div>
            </div>

            <section
              aria-label="관련 일기"
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">관련 일기</h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">최근 5개</span>
              </div>

              {relatedLoading ? (
                <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  로딩 중...
                </p>
              ) : related.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  관련 일기가 없어요.
                </p>
              ) : (
                <div className="space-y-3">
                  {related.map((d) => (
                    <DiaryCard key={d.id} diary={d} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-zinc-500">일기가 없어요.</p>
        )}
      </div>
    </div>
  );
}
