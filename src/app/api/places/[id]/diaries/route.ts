import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const placeId = context.params.id;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const [diaries, total] = await Promise.all([
    prisma.diary.findMany({
      where: { placeId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    }),
    prisma.diary.count({ where: { placeId } }),
  ]);

  const diaryIds = diaries.map((d) => d.id);

  const [likes, scraps] = await Promise.all([
    diaryIds.length
      ? prisma.diaryLike.findMany({
          where: { userId: user.id, diaryId: { in: diaryIds } },
          select: { diaryId: true },
        })
      : Promise.resolve([]),
    diaryIds.length
      ? prisma.diaryScrap.findMany({
          where: { userId: user.id, diaryId: { in: diaryIds } },
          select: { diaryId: true },
        })
      : Promise.resolve([]),
  ]);

  const likedSet = new Set(likes.map((l) => l.diaryId));
  const scrapedSet = new Set(scraps.map((s) => s.diaryId));

  const items = diaries.map((d) => ({
    ...d,
    liked: likedSet.has(d.id),
    scrapped: scrapedSet.has(d.id),
  }));

  return NextResponse.json({
    items,
    total,
    limit: take,
    offset: skip,
  });
}
