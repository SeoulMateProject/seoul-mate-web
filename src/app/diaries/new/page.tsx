"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createDiary } from "@/features/diaries/api/client";

function DiaryNewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const placeId = useMemo(() => searchParams.get("placeId"), [searchParams]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(placeId) && title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!placeId) {
      setError("장소 정보가 없어 일기를 작성할 수 없어요.");
      return;
    }
    if (!canSubmit) return;

    try {
      setLoading(true);
      setError(null);

      const diary = await createDiary({
        placeId,
        title: title.trim(),
        content: content.trim(),
      });

      router.push(`/diaries/${diary.id}`);
    } catch (err) {
      console.error(err);
      setError("일기 작성에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">일기 작성</div>
          <div className="h-8 w-[65px]" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          {placeId ? null : (
            <p className="text-sm text-red-500">placeId가 없어 일기 작성을 진행할 수 없어요.</p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0D00A4] focus:ring-1 focus:ring-[#0D00A4] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘의 이야기를 작성해주세요"
              rows={8}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0D00A4] focus:ring-1 focus:ring-[#0D00A4] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D00A4] px-3 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Image
                  src="/icons/distance-active.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="opacity-90"
                />
                작성 중...
              </>
            ) : (
              "작성하기"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DiaryNewPage() {
  return (
    <Suspense>
      <DiaryNewForm />
    </Suspense>
  );
}
