"use client";

import { useEffect, useState } from "react";
import type { DiaryWithLikeScrap, PaginatedResponse } from "../api/types";
import { fetchMyDiaries } from "../api/client";

export function useMyDiaries() {
  const [items, setItems] = useState<DiaryWithLikeScrap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res: PaginatedResponse<DiaryWithLikeScrap> = await fetchMyDiaries({
          limit: 20,
          offset: 0,
        });
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      } catch {
        if (cancelled) return;
        setError("로그인 후 일기를 볼 수 있어요.");
        setItems([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error, total };
}
