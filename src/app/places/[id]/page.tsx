"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { togglePlaceLike } from "@/features/places/api/client";

type PlaceDetail = {
  id: string;
  externalId: string | null;
  name: string;
  district: string | null;
  address: string | null;
  newAddress: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  openDays: string | null;
  closedDays: string | null;
  transportInfo: string | null;
  tags: string[];
  accessibility: string | null;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
};

type PlaceDiaryItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  likeCount: number;
  scrapped: boolean;
  user?: {
    profile?: {
      nickname?: string | null;
    };
  };
};

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

export default function PlaceDetailPage() {
  const params = useParams<{ id: string }>();
  const placeId = useMemo(() => {
    if (!params?.id) return null;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [diaries, setDiaries] = useState<PlaceDiaryItem[]>([]);
  const [diariesLoading, setDiariesLoading] = useState(false);

  useEffect(() => {
    if (!placeId) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        const res = await fetch(`/api/places/${placeId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed: ${res.status}`);
        }

        const data = (await res.json()) as PlaceDetail;
        if (cancelled) return;
        setPlace(data);
        setLiked(Boolean(data.liked));
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("장소 정보를 불러오지 못했어요.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  useEffect(() => {
    if (!placeId) return;

    const token = getAccessToken();
    if (!token) {
      setDiaries([]);
      return;
    }

    let cancelled = false;

    async function run() {
      setDiariesLoading(true);
      try {
        const res = await fetch(`/api/places/${placeId}/diaries?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // 401/기타 에러는 UI에서 조용히 처리
          return;
        }

        const json = await res.json();
        const items = (json?.items ?? []) as PlaceDiaryItem[];

        if (cancelled) return;
        setDiaries(items);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
      } finally {
        if (cancelled) return;
        setDiariesLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  const heartSrc = liked ? "/icons/heart-active.svg" : "/icons/heart.svg";

  const handleToggleLike = async () => {
    if (!placeId) return;
    try {
      const res = await togglePlaceLike(placeId);
      setLiked(res.liked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDiaryLike = async (diaryId: string) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/diaries/${diaryId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const json = (await res.json()) as {
        liked: boolean;
        diary?: { likeCount?: number };
      };

      setDiaries((prev) =>
        prev.map((d) =>
          d.id === diaryId
            ? {
                ...d,
                liked: Boolean(json.liked),
                likeCount:
                  typeof json.diary?.likeCount === "number" ? json.diary.likeCount : d.likeCount,
              }
            : d,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto max-w-md">
        {loading ? (
          <p className="py-6 text-center text-sm text-zinc-500">로딩 중...</p>
        ) : error ? (
          <p className="py-6 text-center text-sm text-red-500">{error}</p>
        ) : place ? (
          <>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {place.name}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {place.district ?? "구 정보 없음"}
                  </p>
                  {place.address ? (
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">{place.address}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 dark:bg-zinc-950 dark:ring-zinc-800"
                  aria-label="장소 좋아요 토글"
                >
                  <Image src={heartSrc} alt="좋아요" width={18} height={18} />
                </button>
              </div>
            </div>

            <section aria-label="장소 일기 목록" className="mt-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    이 장소의 일기
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">최근 5개</span>
                </div>

                {diariesLoading ? (
                  <p className="py-6 text-center text-sm text-zinc-500">로딩 중...</p>
                ) : diaries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500">
                    로그인 후 일기를 볼 수 있어요.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {diaries.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                              {d.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {d.user?.profile?.nickname ?? "작성자 없음"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleDiaryLike(d.id)}
                            className="flex items-center gap-1 rounded-xl bg-zinc-50 px-2.5 py-1.5 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 dark:bg-zinc-950 dark:ring-zinc-800"
                            aria-label="일기 좋아요 토글"
                          >
                            <Image
                              src={d.liked ? "/icons/heart-active.svg" : "/icons/heart.svg"}
                              alt="일기 좋아요"
                              width={16}
                              height={16}
                            />
                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                              {d.likeCount ?? 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-zinc-500">장소가 없어요.</p>
        )}
      </div>
    </div>
  );
}
