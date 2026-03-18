"use client";

import type { ButtonHTMLAttributes } from "react";

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function AuthSubmitButton({ loading, disabled, children, ...rest }: AuthSubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`inline-flex w-full items-center justify-center rounded-xl bg-[#0D00A4] px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60`}
      {...rest}
    >
      {loading ? "로그인 중..." : children}
    </button>
  );
}
