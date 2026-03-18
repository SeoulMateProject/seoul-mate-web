import type { SignInRequest, SignInSuccessResponse, SignInErrorResponse } from "./types";

async function postJson<TSuccess, TError>(
  url: string,
  body: unknown,
): Promise<{ ok: true; data: TSuccess } | { ok: false; error: TError; status: number }> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as TSuccess | TError;

  if (!res.ok) {
    return {
      ok: false,
      error: json as TError,
      status: res.status,
    };
  }

  return {
    ok: true,
    data: json as TSuccess,
  };
}

export async function signIn(request: SignInRequest) {
  return postJson<SignInSuccessResponse, SignInErrorResponse>("/api/auth/sign-in", request);
}
