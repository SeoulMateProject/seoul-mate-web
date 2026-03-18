import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const [items, total] = await Promise.all([
    prisma.diary.findMany({
      where: { userId: user.id },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.diary.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    items,
    total,
    limit: take,
    offset: skip,
  });
}
