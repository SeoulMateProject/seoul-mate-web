import type { DistrictCode, PaginatedResponse, Place } from "./types";

const DEFAULT_LIMIT = 20;

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
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface FetchPlacesParams {
  q?: string;
  district?: DistrictCode;
  limit?: number;
  offset?: number;
}

export async function fetchPlaces(
  params: FetchPlacesParams = {},
): Promise<PaginatedResponse<Place>> {
  const query = buildQuery({
    q: params.q,
    district: params.district,
    limit: params.limit ?? DEFAULT_LIMIT,
    offset: params.offset,
  });

  return getJson<PaginatedResponse<Place>>(`/api/places${query}`);
}

export interface TrendingPlace extends Place {
  likeCount: number;
  liked: boolean;
}

export interface FetchTrendingPlacesParams {
  district?: DistrictCode;
  limit?: number;
}

export async function fetchTrendingPlaces(
  params: FetchTrendingPlacesParams = {},
): Promise<PaginatedResponse<TrendingPlace>> {
  const query = buildQuery({
    district: params.district,
    limit: params.limit ?? 12,
  });

  return getJson<PaginatedResponse<TrendingPlace>>(`/api/places/trending${query}`);
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

export async function togglePlaceLike(placeId: string): Promise<{ liked: boolean }> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`/api/places/${placeId}/like`, {
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

  return (await res.json()) as { liked: boolean };
}
