import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      user: data.user,
      session: data.session,
    },
    { status: 200 },
  );
}
