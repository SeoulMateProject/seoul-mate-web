"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Place = {
  id: string;
  name: string;
  district: string | null;
  likeCount?: number;
  liked?: boolean;
};

const districts = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

async function fetchTrending(district?: string) {
  const params = new URLSearchParams();
  params.set("limit", "12");
  if (district) params.set("district", district);

  const res = await fetch(`/api/places/trending?${params.toString()}`, { method: "GET" });
  if (!res.ok) return { items: [] as Place[] };

  const json = (await res.json()) as { items: Place[] };
  return json;
}

async function fetchPlaces(q: string, district?: string) {
  const params = new URLSearchParams();
  params.set("limit", "30");
  params.set("q", q);
  if (district) params.set("district", district);

  const res = await fetch(`/api/places?${params.toString()}`, { method: "GET" });
  if (!res.ok) return { items: [] as Place[] };

  const json = (await res.json()) as { items: Place[] };
  return json;
}

function Heart({ liked }: { liked?: boolean }) {
  const src = liked ? "/icons/heart-active.svg" : "/icons/heart.svg";
  return <Image src={src} alt="좋아요" width={20} height={20} />;
}

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>("종로구");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"trending" | "search">("trending");

  const [trending, setTrending] = useState<Place[]>([]);
  const [results, setResults] = useState<Place[]>([]);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  useEffect(() => {
    if (mode !== "trending") return;
    fetchTrending(selectedDistrict).then((r) => setTrending(r.items));
  }, [mode, selectedDistrict]);

  async function onSubmitSearch() {
    if (!canSearch) return;
    setMode("search");
    const q = query.trim();
    const r = await fetchPlaces(q, selectedDistrict);
    setResults(r.items);
  }

  const list = mode === "trending" ? trending : results;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">장소 찾기</h1>

        <div className="mt-4 flex gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소를 입력하세요..."
            className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitSearch();
            }}
          />
          <button
            className="h-10 px-4 rounded-xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-900 font-semibold disabled:opacity-60"
            onClick={onSubmitSearch}
            disabled={!canSearch}
          >
            검색
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            className={`shrink-0 px-3 py-1 rounded-full text-sm border ${
              !selectedDistrict
                ? "bg-[#0D00A4] text-white border-[#0D00A4]"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
            }`}
            onClick={() => {
              setSelectedDistrict(undefined);
              setMode("trending");
            }}
          >
            전체
          </button>

          {districts.map((d) => {
            const active = selectedDistrict === d;
            return (
              <button
                key={d}
                className={`shrink-0 px-3 py-1 rounded-full text-sm border ${
                  active
                    ? "bg-[#0D00A4] text-white border-[#0D00A4]"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                }`}
                onClick={() => {
                  setSelectedDistrict(d);
                  setMode("trending");
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {mode === "trending" ? "요즘 핫한 장소들" : "검색 결과"}
            </h2>
            {mode === "search" && (
              <button
                className="text-sm font-semibold text-[#0D00A4]"
                onClick={() => {
                  setMode("trending");
                  setResults([]);
                }}
              >
                돌아가기
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {p.district ?? ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Heart liked={p.liked} />
                    <div className="text-sm font-semibold text-[#0D00A4]">{p.likeCount ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            요즘 핫한 코스들
          </h2>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            (로그인 후) PlaceList 템플릿/코스를 불러오는 화면을 다음 PR에서 연결할게요.
          </div>
        </div>
      </div>
    </div>
  );
}
