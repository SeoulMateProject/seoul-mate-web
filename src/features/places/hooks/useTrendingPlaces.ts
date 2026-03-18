"use client";

import { useEffect, useState } from "react";
import type { DistrictCode } from "../api/types";
import { fetchTrendingPlaces, type TrendingPlace } from "../api/client";

export function useTrendingPlaces(district?: DistrictCode | null) {
  const [items, setItems] = useState<TrendingPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchTrendingPlaces({
          district: district ?? undefined,
        });

        if (cancelled) return;
        setItems(res.items);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("트렌딩 장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [district]);

  return { items, loading, error };
}
