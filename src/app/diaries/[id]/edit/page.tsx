"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchDiaryById, updateDiary } from "@/features/diaries/api/client";

export default function DiaryEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const diaryId = useMemo(() => {
    if (!params?.id) return null;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diaryId) return;

    let cancelled = false;

    async function run() {
      setInitialLoading(true);
      try {
        const data = await fetchDiaryById(diaryId);
        if (cancelled) return;
        setTitle(data.title);
        setContent(data.content);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("일기 정보를 불러오지 못했어요.");
      } finally {
        if (cancelled) return;
        setInitialLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [diaryId]);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!diaryId || !canSubmit) return;

    try {
      setSubmitLoading(true);
      setError(null);

      await updateDiary(diaryId, {
        title: title.trim(),
        content: content.trim(),
      });

      router.push(`/diaries/${diaryId}`);
    } catch (err) {
      console.error(err);
      setError("일기 수정에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSubmitLoading(false);
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
          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">일기 수정</div>
          <div className="h-8 w-[65px]" />
        </div>

        {initialLoading ? (
          <p className="py-6 text-center text-sm text-zinc-500">로딩 중...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
          >
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
                placeholder="내용을 입력해주세요"
                rows={8}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0D00A4] focus:ring-1 focus:ring-[#0D00A4] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={!canSubmit || submitLoading}
              className="w-full rounded-xl bg-[#0D00A4] px-3 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? "저장 중..." : "저장하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
