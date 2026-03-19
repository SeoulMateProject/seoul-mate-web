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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await prisma.placeList.findFirst({
    where: { id: (await context.params).id, userId: user.id },
    include: {
      items: {
        include: {
          place: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!list) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  const placeIds = list.items.map((it) => it.place.id);
  const uniqPlaceIds = Array.from(new Set(placeIds));

  const [likeGroups, likedRows, diaryGroups] = await Promise.all([
    uniqPlaceIds.length
      ? prisma.placeLike.groupBy({
          by: ["placeId"],
          where: { placeId: { in: uniqPlaceIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as Array<{ placeId: string; _count: { _all: number } }>),
    uniqPlaceIds.length
      ? prisma.placeLike.findMany({
          where: { userId: user.id, placeId: { in: uniqPlaceIds } },
          select: { placeId: true },
        })
      : Promise.resolve([] as Array<{ placeId: string }>),
    uniqPlaceIds.length
      ? prisma.diary.groupBy({
          by: ["placeId"],
          where: { placeId: { in: uniqPlaceIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as Array<{ placeId: string; _count: { _all: number } }>),
  ]);

  const likeCountMap = new Map<string, number>();
  for (const g of likeGroups) likeCountMap.set(g.placeId, g._count._all);

  const likedSet = new Set(likedRows.map((r) => r.placeId));

  const diaryCountMap = new Map<string, number>();
  for (const g of diaryGroups) diaryCountMap.set(g.placeId, g._count._all);

  const enriched = {
    ...list,
    items: list.items.map((it) => ({
      ...it,
      place: {
        ...it.place,
        likeCount: likeCountMap.get(it.place.id) ?? 0,
        liked: likedSet.has(it.place.id),
        diaryCount: diaryCountMap.get(it.place.id) ?? 0,
      },
    })),
  };

  return NextResponse.json(enriched);
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const title = body?.title;
  const description = body?.description;

  const hasTitle = typeof title === "string";
  const hasDescription =
    description === null || typeof description === "string" || typeof description === "undefined";

  if (!hasTitle && !hasDescription) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const list = await prisma.placeList.findFirst({
    where: { id: (await context.params).id, userId: user.id },
  });

  if (!list) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  const updated = await prisma.placeList.update({
    where: { id: list.id },
    data: {
      title: hasTitle ? title : list.title,
      description: description === undefined ? list.description : description,
    },
    include: {
      items: {
        include: {
          place: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return NextResponse.json(updated);
}
