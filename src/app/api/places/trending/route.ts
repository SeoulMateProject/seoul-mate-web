import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const take = Math.min(Number(limitParam) || 12, 50);

  const district = searchParams.get("district") ?? undefined;

  const user = await getPrismaUserFromRequest(request);

  // 좋아요 집계(PlaceLike 기반)로 Top N 뽑기
  const likeGroups = await prisma.placeLike.groupBy({
    by: ["placeId"],
    where: {},
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        _all: "desc",
      },
    },
    take,
  });

  const placeIds = likeGroups.map((g) => g.placeId);

  if (placeIds.length === 0) {
    return NextResponse.json({
      items: [],
      total: 0,
      limit: take,
    });
  }

  const [places, likedRows] = await Promise.all([
    prisma.place.findMany({
      where: {
        id: { in: placeIds },
        ...(district ? { district: { equals: district } } : {}),
      },
      select: {
        id: true,
        externalId: true,
        name: true,
        district: true,
        address: true,
        newAddress: true,
        phone: true,
        website: true,
        openingHours: true,
        openDays: true,
        closedDays: true,
        transportInfo: true,
        tags: true,
        accessibility: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    user
      ? prisma.placeLike.findMany({
          where: {
            userId: user.id,
            placeId: { in: placeIds },
          },
          select: { placeId: true },
        })
      : Promise.resolve([] as Array<{ placeId: string }>),
  ]);

  const likeCountMap = new Map<string, number>();
  for (const g of likeGroups) {
    likeCountMap.set(g.placeId, g._count._all);
  }

  const likedSet = new Set(likedRows.map((r) => r.placeId));

  const items = placeIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => {
      const place = p as (typeof places)[number];
      return {
        ...place,
        likeCount: likeCountMap.get(place.id) ?? 0,
        liked: likedSet.has(place.id),
      };
    });

  return NextResponse.json({
    items,
    total: items.length,
    limit: take,
  });
}
