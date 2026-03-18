import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const baseDiary = await prisma.diary.findUnique({
    where: { id: (await context.params).id },
    select: { id: true, placeId: true },
  });

  if (!baseDiary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  const where = {
    placeId: baseDiary.placeId,
    id: { not: baseDiary.id },
  };

  const [diaries, total] = await Promise.all([
    prisma.diary.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    }),
    prisma.diary.count({ where }),
  ]);

  const diaryIds = diaries.map((d) => d.id);

  const [likes, scraps] = await Promise.all([
    user && diaryIds.length
      ? prisma.diaryLike.findMany({
          where: { userId: user.id, diaryId: { in: diaryIds } },
          select: { diaryId: true },
        })
      : Promise.resolve([] as Array<{ diaryId: string }>),
    user && diaryIds.length
      ? prisma.diaryScrap.findMany({
          where: { userId: user.id, diaryId: { in: diaryIds } },
          select: { diaryId: true },
        })
      : Promise.resolve([] as Array<{ diaryId: string }>),
  ]);

  const likedSet = new Set(likes.map((l) => l.diaryId));
  const scrappedSet = new Set(scraps.map((s) => s.diaryId));

  const items = diaries.map((d) => ({
    ...d,
    liked: likedSet.has(d.id),
    scrapped: scrappedSet.has(d.id),
  }));

  return NextResponse.json({
    items,
    total,
    limit: take,
    offset: skip,
  });
}
