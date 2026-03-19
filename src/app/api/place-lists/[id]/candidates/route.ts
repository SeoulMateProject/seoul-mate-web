import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parsePagination(searchParams: URLSearchParams) {
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  return { take, skip };
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const source = (searchParams.get("source") ?? "liked").toLowerCase();
  const q = searchParams.get("q") ?? undefined;
  const district = searchParams.get("district") ?? undefined;

  const { take, skip } = parsePagination(searchParams);

  const list = await prisma.placeList.findFirst({
    where: { id: (await context.params).id, userId: user.id },
  });

  if (!list) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  const existingItems = await prisma.placeListItem.findMany({
    where: { placeListId: list.id },
    select: { placeId: true },
  });

  const existingPlaceIdSet = new Set(existingItems.map((i) => i.placeId));

  const candidatePlaceIds =
    source === "liked" || source === "scrapped"
      ? await (async () => {
          const candidatePlaceIdArr: string[] = [];

          if (source === "liked") {
            const likes = await prisma.placeLike.findMany({
              where: {
                userId: user.id,
                ...(existingItems.length
                  ? { placeId: { notIn: existingItems.map((i) => i.placeId) } }
                  : {}),
                ...(district || q
                  ? {
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
                    }
                  : {}),
              },
              select: { placeId: true },
              orderBy: { createdAt: "desc" },
            });

            return likes.map((l) => l.placeId);
          }

          // source === "scrapped"
          // DiaryScrap -> Diary -> PlaceId 추출 후 중복 제거
          const scraps = await prisma.diaryScrap.findMany({
            where: {
              userId: user.id,
              ...(existingItems.length
                ? { diary: { placeId: { notIn: existingItems.map((i) => i.placeId) } } }
                : {}),
              ...(district || q
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
              diary: {
                select: {
                  placeId: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          for (const s of scraps) {
            const pid = s.diary.placeId;
            if (!existingPlaceIdSet.has(pid)) candidatePlaceIdArr.push(pid);
          }
          return Array.from(new Set(candidatePlaceIdArr));
        })()
      : [];

  // candidatePlaceIds는 이미 중복 제거/정렬 방향이 들어가 있지만, 안전하게 Set으로 한 번 더 정리
  const uniqueCandidates = Array.from(new Set(candidatePlaceIds));

  const sliced = uniqueCandidates.slice(skip, skip + take);

  if (sliced.length === 0) {
    return NextResponse.json({
      items: [],
      total: uniqueCandidates.length,
      limit: take,
      offset: skip,
    });
  }

  const [places, likeGroups, diaryGroups, likedRows, scrappedRows] = await Promise.all([
    prisma.place.findMany({
      where: { id: { in: sliced } },
    }),
    prisma.placeLike.groupBy({
      by: ["placeId"],
      where: { placeId: { in: sliced } },
      _count: { _all: true },
    }),
    prisma.diary.groupBy({
      by: ["placeId"],
      where: { placeId: { in: sliced } },
      _count: { _all: true },
    }),
    prisma.placeLike.findMany({
      where: { userId: user.id, placeId: { in: sliced } },
      select: { placeId: true },
    }),
    prisma.diaryScrap.findMany({
      where: {
        userId: user.id,
        diary: {
          placeId: { in: sliced },
        },
      },
      select: { diary: { select: { placeId: true } } },
    }),
  ]);

  const likeCountMap = new Map<string, number>();
  for (const g of likeGroups) likeCountMap.set(g.placeId, g._count._all);

  const diaryCountMap = new Map<string, number>();
  for (const g of diaryGroups) diaryCountMap.set(g.placeId, g._count._all);

  const likedSet = new Set(likedRows.map((r) => r.placeId));
  const scrappedSet = new Set(scrappedRows.map((r) => r.diary.placeId));

  const items = sliced
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => {
      const place = p as (typeof places)[number];
      return {
        ...place,
        likeCount: likeCountMap.get(place.id) ?? 0,
        diaryCount: diaryCountMap.get(place.id) ?? 0,
        liked: likedSet.has(place.id),
        scrapped: scrappedSet.has(place.id),
      };
    });

  return NextResponse.json({
    items,
    total: uniqueCandidates.length,
    limit: take,
    offset: skip,
  });
}
