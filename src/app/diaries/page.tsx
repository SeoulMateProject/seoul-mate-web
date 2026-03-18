"use client";

import { DiaryList } from "@/features/diaries/components/DiaryList";
import { useMyDiaries } from "@/features/diaries/hooks/useMyDiaries";

export default function DiariesPage() {
  const { items, loading, error } = useMyDiaries();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto max-w-md">
        <header>
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">일기</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            내 일기를 좋아요/스크랩으로 관리하세요.
          </p>
        </header>

        <section aria-label="내 일기 목록" className="mt-4">
          {loading ? (
            <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">로딩 중...</p>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-500">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              작성한 일기가 아직 없어요.
            </p>
          ) : (
            <DiaryList items={items} />
          )}
        </section>
      </div>
    </div>
  );
}
