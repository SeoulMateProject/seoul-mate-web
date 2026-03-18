import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";

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

export async function getPrismaUserFromRequest(request: Request): Promise<PrismaUser | null> {
  const supaUser = await getUserFromRequest(request);

  if (!supaUser) {
    return null;
  }

  return prisma.user.findUnique({
    where: { supabaseUserId: supaUser.id },
  });
}
