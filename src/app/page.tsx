"use client";

import { useState } from "react";
import type { DistrictCode } from "@/features/places/api/types";
import { SeoulDistrictMap } from "@/features/places/components/SeoulDistrictMap";
import { useTrendingPlaces } from "@/features/places/hooks/useTrendingPlaces";
import { usePlacesSearch } from "@/features/places/hooks/usePlacesSearch";
import { PlaceTrendingList } from "@/features/places/components/PlaceTrendingList";
import { PlaceSearchList } from "@/features/places/components/PlaceSearchList";

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCode | null>(null);
  const { items, loading, error } = useTrendingPlaces(selectedDistrict);
  const [query, setQuery] = useState("");
  const {
    items: searchItems,
    loading: searchLoading,
    error: searchError,
  } = usePlacesSearch({ q: query, district: selectedDistrict });

  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header>
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">장소 찾기</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            지도를 눌러 동네를 고르고, 요즘 핫한 장소들을 둘러보세요.
          </p>
        </header>

        <section aria-label="서울 구 선택 지도">
          <SeoulDistrictMap
            selected={selectedDistrict ?? undefined}
            onSelect={setSelectedDistrict}
          />
        </section>

        <section aria-label="선택된 구 정보">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              {selectedDistrict
                ? `${selectedDistrict}의 요즘 인기 있는 장소들을 곧 보여줄게요.`
                : "구를 선택하면 해당 지역의 인기 장소와 코스들을 보여줄게요."}
            </p>
          </div>
        </section>

        <section aria-label="장소 검색">
          <form
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="장소를 검색해보세요"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#0D00A4] focus:ring-1 focus:ring-[#0D00A4] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              />
            </div>
          </form>
        </section>

        <section aria-label="장소 리스트">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
            {hasQuery ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    검색 결과
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedDistrict ? selectedDistrict : "전체"}
                  </span>
                </div>

                {searchLoading ? (
                  <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    검색 중...
                  </p>
                ) : searchError ? (
                  <p className="py-6 text-center text-sm text-red-500">{searchError}</p>
                ) : searchItems.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    검색 결과가 없어요.
                  </p>
                ) : (
                  <PlaceSearchList items={searchItems} />
                )}
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    요즘 핫한 장소들
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedDistrict ? selectedDistrict : "전체"}
                  </span>
                </div>

                {loading ? (
                  <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    로딩 중...
                  </p>
                ) : error ? (
                  <p className="py-6 text-center text-sm text-red-500">{error}</p>
                ) : items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    장소가 없어요.
                  </p>
                ) : (
                  <PlaceTrendingList items={items} />
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
