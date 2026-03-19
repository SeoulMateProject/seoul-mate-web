"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const tabs = [
  {
    label: "장소 찾기",
    href: "/",
    iconSrc: "/icons/distance.svg",
    activeIconSrc: "/icons/distance-active.svg",
  },
  {
    label: "일기",
    href: "/diaries",
    iconSrc: "/icons/diary.svg",
    activeIconSrc: "/icons/diary-active.svg",
  },
  {
    label: "마이페이지",
    href: "/mypage",
    iconSrc: "/icons/detail.svg",
    activeIconSrc: "/icons/detail-active.svg",
  },
  {
    label: "더보기",
    href: "/more",
    iconSrc: "/icons/heart.svg",
    activeIconSrc: "/icons/heart-active.svg",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-white/90 backdrop-blur border-t border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between h-16 px-2">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 rounded-xl py-2 transition-colors ${
                  isActive
                    ? "text-[#0D00A4] dark:text-[#0D00A4]"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <Image
                  src={isActive ? tab.activeIconSrc : tab.iconSrc}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className={isActive ? "opacity-100" : "opacity-70"}
                />
                <span className="text-[11px] leading-none">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
