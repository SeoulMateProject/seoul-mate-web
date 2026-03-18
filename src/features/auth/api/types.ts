export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInSuccessResponse {
  user: {
    id: string;
    email?: string | null;
  } | null;
  session: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  } | null;
}

export interface SignInErrorResponse {
  error: {
    message: string;
  };
}

export type SignUpSuccessResponse = SignInSuccessResponse;
export type SignUpErrorResponse = SignInErrorResponse;
