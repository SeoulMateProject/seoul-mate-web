import type { PlaceWithLike } from "@/features/places/api/client";
import type { DiaryWithLikeScrap, PaginatedResponse } from "@/features/diaries/api/types";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

function authHeaders(): HeadersInit | undefined {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function fetchLikedPlaces(
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedResponse<PlaceWithLike>> {
  const sp = new URLSearchParams();
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));

  return getJson<PaginatedResponse<PlaceWithLike>>(`/api/places/liked?${sp.toString()}`, {
    headers: authHeaders(),
  });
}

export async function fetchScrappedDiaries(
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedResponse<DiaryWithLikeScrap>> {
  const sp = new URLSearchParams();
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));

  return getJson<PaginatedResponse<DiaryWithLikeScrap>>(`/api/diaries/scraps?${sp.toString()}`, {
    headers: authHeaders(),
  });
}

export async function fetchMyDiaries(
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedResponse<DiaryWithLikeScrap>> {
  const sp = new URLSearchParams();
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));

  return getJson<PaginatedResponse<DiaryWithLikeScrap>>(`/api/diaries/mine?${sp.toString()}`, {
    headers: authHeaders(),
  });
}
