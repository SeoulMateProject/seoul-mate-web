import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

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

  // 유저가 스크랩한 일기(DiaryScrap) 기준으로 장소(Place)를 추출
  // 그리고 해당 장소들에 대해 좋아요/일기 집계 및 liked 플래그를 함께 내려줌
  const diaryScraps = await prisma.diaryScrap.findMany({
    where: {
      userId: user.id,
      ...(q || district
        ? {
            diary: {
              place: {
                ...(district ? { district: { equals: district } } : {}),
                ...(q
                  ? {
                      OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { address: { contains: q, mode: "insensitive" } },
                        { newAddress: { contains: q, mode: "insensitive" } },
                        { tags: { has: q } },
                      ],
                    }
                  : {}),
              },
            },
          }
        : {}),
    },
    select: {
      diaryId: true,
      diary: {
        select: {
          placeId: true,
        },
      },
    },
  });

  const placeIds = Array.from(new Set(diaryScraps.map((s) => s.diary.placeId))).slice(
    skip,
    skip + take,
  );

  if (placeIds.length === 0) {
    return NextResponse.json({ items: [], total: 0, limit: take, offset: skip });
  }

  const [places, likeGroups, diaryGroups, likedRows] = await Promise.all([
    prisma.place.findMany({
      where: {
        id: { in: placeIds },
      },
    }),
    prisma.placeLike.groupBy({
      by: ["placeId"],
      where: { placeId: { in: placeIds } },
      _count: { _all: true },
    }),
    prisma.diary.groupBy({
      by: ["placeId"],
      where: { placeId: { in: placeIds } },
      _count: { _all: true },
    }),
    prisma.placeLike.findMany({
      where: { userId: user.id, placeId: { in: placeIds } },
      select: { placeId: true },
    }),
  ]);

  const likeCountMap = new Map<string, number>();
  for (const g of likeGroups) likeCountMap.set(g.placeId, g._count._all);

  const diaryCountMap = new Map<string, number>();
  for (const g of diaryGroups) diaryCountMap.set(g.placeId, g._count._all);

  const likedSet = new Set(likedRows.map((r) => r.placeId));

  const items = placeIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => {
      const place = p as (typeof places)[number];
      return {
        ...place,
        likeCount: likeCountMap.get(place.id) ?? 0,
        diaryCount: diaryCountMap.get(place.id) ?? 0,
        liked: likedSet.has(place.id),
        scrapped: true,
      };
    });

  return NextResponse.json({
    items,
    total: diaryScraps.length,
    limit: take,
    offset: skip,
  });
}
