"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookie } from "@/lib/authCookie";

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

const INFO_ITEMS: MenuItem[] = [
  { label: "서비스 이용약관", href: "https://example.com/terms" },
  { label: "개인정보처리방침", href: "https://example.com/privacy" },
  { label: "오픈소스 라이선스", href: "https://example.com/licenses" },
];

const APP_VERSION = "0.1.0";

export default function MorePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("user_email");
      setEmail(stored ?? null);
    }
    load();
  }, []);

  const handleLogout = () => {
    if (!confirm("로그아웃 하시겠어요?")) return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    clearAuthCookie();
    router.replace("/auth/sign-in");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto max-w-md space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">더보기</h1>
        </header>

        {email && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">로그인 계정</p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {email}
            </p>
          </section>
        )}

        <section>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            정보
          </p>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {INFO_ITEMS.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between px-4 py-3.5 text-sm text-zinc-800 transition-colors hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/60 ${
                  idx !== INFO_ITEMS.length - 1
                    ? "border-b border-zinc-100 dark:border-zinc-800"
                    : ""
                }`}
              >
                <span>{item.label}</span>
                <span className="text-zinc-400 dark:text-zinc-500">›</span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <span>로그아웃</span>
              <span>›</span>
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          서울메이트 v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
