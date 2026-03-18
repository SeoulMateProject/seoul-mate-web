import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const user = data.user;

  if (!user) {
    return NextResponse.json({ error: "User not returned from Supabase" }, { status: 500 });
  }

  await prisma.user.create({
    data: {
      supabaseUserId: user.id,
      email: user.email ?? email,
      profile: {
        create: {},
      },
    },
  });

  return NextResponse.json({ user, session: data.session }, { status: 201 });
}
