import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getPrismaUserFromRequest(request);

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

  const diaryIds = items.map((d) => d.id);

  const [likes, scraps] = await Promise.all([
    diaryIds.length
      ? prisma.diaryLike.findMany({
          where: { userId: user.id, diaryId: { in: diaryIds } },
          select: { diaryId: true },
        })
      : Promise.resolve([] as Array<{ diaryId: string }>),
    diaryIds.length
      ? prisma.diaryScrap.findMany({
          where: { userId: user.id, diaryId: { in: diaryIds } },
          select: { diaryId: true },
        })
      : Promise.resolve([] as Array<{ diaryId: string }>),
  ]);

  const likedSet = new Set(likes.map((l) => l.diaryId));
  const scrappedSet = new Set(scraps.map((s) => s.diaryId));

  const enriched = items.map((d) => ({
    ...d,
    liked: likedSet.has(d.id),
    scrapped: scrappedSet.has(d.id),
  }));

  return NextResponse.json({
    items: enriched,
    total,
    limit: take,
    offset: skip,
  });
}
