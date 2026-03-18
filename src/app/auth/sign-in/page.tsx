"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { signIn } from "@/features/auth/api/client";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn({ email, password });

      if (!result.ok) {
        const message =
          result.error?.error?.message ?? "로그인에 실패했습니다. 다시 시도해 주세요.";
        setError(message);
        return;
      }

      const token = result.data.session?.access_token;
      if (token) {
        window.localStorage.setItem("access_token", token);
        window.localStorage.setItem("user_email", email);
      }

      router.push(callbackUrl);
    } catch (e) {
      console.error(e);
      setError("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="로그인" description="서울의 핫한 장소와 코스를 보려면 먼저 로그인해 주세요.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthTextField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthTextField
          label="비밀번호"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <AuthSubmitButton loading={loading}>로그인</AuthSubmitButton>

        <p className="pt-1 text-center text-xs text-zinc-500">
          계정이 없으신가요?{" "}
          <Link
            className="font-medium text-[#0D00A4] hover:underline"
            href={`/auth/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            회원가입
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
