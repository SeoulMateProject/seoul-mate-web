"use client";

import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 pb-16 pt-8 dark:bg-black">
      <div className="w-full max-w-md">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          ) : null}
        </header>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
          {children}
        </div>
      </div>
    </div>
  );
}
