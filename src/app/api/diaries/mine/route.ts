import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const [items, total] = await Promise.all([
    prisma.diary.findMany({
      where: { userId },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.diary.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    items,
    total,
    limit: take,
    offset: skip,
  });
}
