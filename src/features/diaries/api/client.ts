import type { Diary, DiaryWithLikeScrap, PaginatedResponse } from "./types";

const DEFAULT_LIMIT = 20;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function fetchMyDiaries(
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedResponse<DiaryWithLikeScrap>> {
  const query = buildQuery({
    limit: params.limit ?? DEFAULT_LIMIT,
    offset: params.offset ?? 0,
  });
  return getJson<PaginatedResponse<DiaryWithLikeScrap>>(`/api/diaries/mine${query}`);
}

export async function fetchDiaryById(diaryId: string): Promise<DiaryWithLikeScrap> {
  const accessToken = getAccessToken();
  return getJson<DiaryWithLikeScrap>(`/api/diaries/${diaryId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
}

export async function fetchRelatedDiaries(
  diaryId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedResponse<DiaryWithLikeScrap>> {
  const query = buildQuery({
    limit: params.limit ?? 5,
    offset: params.offset ?? 0,
  });

  const accessToken = getAccessToken();
  return getJson<PaginatedResponse<DiaryWithLikeScrap>>(`/api/diaries/${diaryId}/related${query}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
}

export async function toggleDiaryLike(
  diaryId: string,
): Promise<{ liked: boolean; likeCount: number | null }> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("Unauthorized");

  const res = await fetch(`/api/diaries/${diaryId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json = (await res.json()) as {
    liked: boolean;
    diary?: { likeCount?: number };
  };

  return {
    liked: Boolean(json.liked),
    likeCount: typeof json.diary?.likeCount === "number" ? json.diary.likeCount : null,
  };
}

export async function toggleDiaryScrap(diaryId: string): Promise<{ scrapped: boolean }> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("Unauthorized");

  const res = await fetch(`/api/diaries/${diaryId}/scrap`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json = (await res.json()) as { scraped: boolean };

  return { scrapped: Boolean(json.scraped) };
}

export async function createDiary(params: {
  placeId: string;
  title: string;
  content: string;
}): Promise<Diary> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("Unauthorized");

  const res = await fetch(`/api/diaries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      placeId: params.placeId,
      title: params.title,
      content: params.content,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return getJson<Diary>(`/api/diaries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      placeId: params.placeId,
      title: params.title,
      content: params.content,
    }),
  });
}
