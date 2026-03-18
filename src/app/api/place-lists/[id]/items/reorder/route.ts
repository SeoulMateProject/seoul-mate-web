import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const placeIds: unknown = body?.placeIds;

  if (!Array.isArray(placeIds) || !placeIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (placeIds.length === 0) {
    return NextResponse.json({ error: "placeIds must not be empty" }, { status: 400 });
  }

  const list = await prisma.placeList.findFirst({
    where: { id: context.params.id, userId: user.id },
  });

  if (!list) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  const items = await prisma.placeListItem.findMany({
    where: { placeListId: list.id },
    select: { placeId: true },
    orderBy: { order: "asc" },
  });

  if (items.length !== placeIds.length) {
    return NextResponse.json(
      { error: "placeIds must match existing items count" },
      { status: 400 },
    );
  }

  const existingPlaceIdSet = new Set(items.map((i) => i.placeId));
  const inputSet = new Set(placeIds as string[]);

  if (existingPlaceIdSet.size !== inputSet.size) {
    return NextResponse.json({ error: "placeIds contains duplicates" }, { status: 400 });
  }

  for (const placeId of placeIds as string[]) {
    if (!existingPlaceIdSet.has(placeId)) {
      return NextResponse.json(
        { error: "One or more places are not in this list" },
        { status: 404 },
      );
    }
  }

  await prisma.$transaction(
    (placeIds as string[]).map((placeId, index) =>
      prisma.placeListItem.update({
        where: {
          placeListId_placeId: {
            placeListId: list.id,
            placeId,
          },
        },
        data: { order: index },
      }),
    ),
  );

  const updatedList = await prisma.placeList.findFirst({
    where: { id: list.id },
    include: {
      items: {
        include: { place: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!updatedList) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  return NextResponse.json(updatedList, { status: 200 });
}
