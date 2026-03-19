import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const district = searchParams.get("district") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const placeFilter: Prisma.PlaceWhereInput = {
    ...(district ? { district: { equals: district } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { address: { contains: q, mode: "insensitive" as const } },
            { newAddress: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ],
        }
      : {}),
  };

  const where: Prisma.PlaceLikeWhereInput = {
    userId: user.id,
    place: placeFilter,
  };

  const [likes, total] = await Promise.all([
    prisma.placeLike.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        place: true,
      },
    }),
    prisma.placeLike.count({ where }),
  ]);

  const placeIds = likes.map((l) => l.placeId);

  const [likeGroups, diaryGroups] = await Promise.all([
    placeIds.length
      ? prisma.placeLike.groupBy({
          by: ["placeId"],
          where: { placeId: { in: placeIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as Array<{ placeId: string; _count: { _all: number } }>),
    placeIds.length
      ? prisma.diary.groupBy({
          by: ["placeId"],
          where: { placeId: { in: placeIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as Array<{ placeId: string; _count: { _all: number } }>),
  ]);

  const likeCountMap = new Map<string, number>();
  for (const g of likeGroups) likeCountMap.set(g.placeId, g._count._all);

  const diaryCountMap = new Map<string, number>();
  for (const g of diaryGroups) diaryCountMap.set(g.placeId, g._count._all);

  return NextResponse.json({
    items: likes.map((l) => ({
      ...l.place,
      likeCount: likeCountMap.get(l.placeId) ?? 0,
      diaryCount: diaryCountMap.get(l.placeId) ?? 0,
      liked: true,
    })),
    total,
    limit: take,
    offset: skip,
  });
}
