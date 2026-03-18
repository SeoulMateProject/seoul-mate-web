import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const district = searchParams.get("district") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
              { newAddress: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {},
      district ? { district: { equals: district } } : {},
    ],
  };

  const user = await getPrismaUserFromRequest(request);

  const [items, total] = await Promise.all([
    prisma.place.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.place.count({ where }),
  ]);

  const placeIds = items.map((p) => p.id);

  const [likeGroups, likedRows] = await Promise.all([
    placeIds.length
      ? prisma.placeLike.groupBy({
          by: ["placeId"],
          where: { placeId: { in: placeIds } },
          _count: { id: true },
        })
      : Promise.resolve([] as Array<{ placeId: string; _count: { id: number } }>),
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
  for (const g of likeGroups) likeCountMap.set(g.placeId, g._count.id);

  const likedSet = new Set(likedRows.map((r) => r.placeId));

  return NextResponse.json({
    items: items.map((p) => ({
      ...p,
      likeCount: likeCountMap.get(p.id) ?? 0,
      liked: likedSet.has(p.id),
    })),
    total,
    limit: take,
    offset: skip,
  });
}
