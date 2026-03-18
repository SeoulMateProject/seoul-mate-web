"use client";

import { useState } from "react";
import { LikedPlaceList } from "@/features/mypage/components/LikedPlaceList";
import { ScrappedDiaryList } from "@/features/mypage/components/ScrappedDiaryList";
import { MyDiaryList } from "@/features/mypage/components/MyDiaryList";

type Tab = "liked" | "scrapped" | "mine";

const TABS: { id: Tab; label: string }[] = [
  { id: "liked", label: "좋아요 장소" },
  { id: "scrapped", label: "스크랩 일기" },
  { id: "mine", label: "내 일기" },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("liked");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">마이페이지</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            내가 저장한 장소와 일기를 확인해요.
          </p>
        </header>

        <div className="mb-4 flex gap-2 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0D00A4] text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section>
          {activeTab === "liked" && <LikedPlaceList />}
          {activeTab === "scrapped" && <ScrappedDiaryList />}
          {activeTab === "mine" && <MyDiaryList />}
        </section>
      </div>
    </div>
  );
}
