import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
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

  const places = await prisma.place.findMany({
    where: { id: { in: placeIds } },
    select: { id: true },
  });

  if (places.length !== placeIds.length) {
    return NextResponse.json({ error: "One or more places not found" }, { status: 404 });
  }

  const existingCount = await prisma.placeListItem.count({
    where: { placeListId: list.id },
  });

  const upserted = await prisma.$transaction(
    placeIds.map((placeId, index) =>
      prisma.placeListItem.upsert({
        where: {
          placeListId_placeId: {
            placeListId: list.id,
            placeId,
          },
        },
        update: {
          order: existingCount + index,
        },
        create: {
          placeListId: list.id,
          placeId,
          order: existingCount + index,
        },
      }),
    ),
  );

  void upserted;

  const updatedList = await prisma.placeList.findFirst({
    where: { id: list.id },
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

  if (!updatedList) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  return NextResponse.json(updatedList, { status: 201 });
}
