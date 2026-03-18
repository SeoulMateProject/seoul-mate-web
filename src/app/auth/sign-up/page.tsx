"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { signUp } from "@/features/auth/api/client";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password || !passwordConfirm) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp({ email, password });

      if (!result.ok) {
        const message =
          result.error?.error?.message ?? "회원가입에 실패했습니다. 다시 시도해 주세요.";
        setError(message);
        return;
      }

      router.push("/auth/sign-in?from=sign-up");
    } catch (e) {
      console.error(e);
      setError("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="회원가입"
      description="서울메이트와 함께할 계정을 만들어 주세요. 이후 로그인하여 장소와 코스를 관리할 수 있어요."
    >
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthTextField
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <AuthSubmitButton loading={loading}>회원가입</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
