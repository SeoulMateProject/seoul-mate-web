import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}
