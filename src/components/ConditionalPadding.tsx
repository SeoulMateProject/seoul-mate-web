"use client";

import { usePathname } from "next/navigation";

export default function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/auth");

  return <div className={`min-h-screen${isAuth ? "" : " pb-16"}`}>{children}</div>;
}
