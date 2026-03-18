"use client";

import { useState } from "react";
import type { DistrictCode } from "@/features/places/api/types";
import { SeoulDistrictMap } from "@/features/places/components/SeoulDistrictMap";

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCode | null>(null);

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
      </div>
    </div>
  );
}
