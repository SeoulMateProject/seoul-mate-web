"use client";

import type { InputHTMLAttributes } from "react";

interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthTextField({ label, error, id, type = "text", ...rest }: AuthTextFieldProps) {
  const inputId = id ?? rest.name ?? label;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={`block w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 dark:bg-zinc-950 ${
          error
            ? "border-red-500 text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-400 dark:text-zinc-50"
            : "border-zinc-200 text-zinc-900 focus:border-[#0D00A4] focus:ring-1 focus:ring-[#0D00A4] dark:border-zinc-700 dark:text-zinc-50"
        }`}
        {...rest}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
