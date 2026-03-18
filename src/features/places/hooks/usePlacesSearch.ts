"use client";

import { useEffect, useState } from "react";
import type { DistrictCode } from "../api/types";
import { fetchPlaces, type PlaceWithLike } from "../api/client";

export function usePlacesSearch(params: { q: string; district?: DistrictCode | null }) {
  const q = params.q.trim();
  const district = params.district ?? undefined;

  const [items, setItems] = useState<PlaceWithLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const delayMs = 300;

    async function run() {
      if (!q) {
        setItems([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetchPlaces({
          q,
          district,
          limit: 20,
          offset: 0,
        });

        if (cancelled) return;
        setItems(res.items);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      run();
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, district]);

  return { items, loading, error };
}
