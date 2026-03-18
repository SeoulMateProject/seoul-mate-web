import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = { userId: user.id };

  const [items, total] = await Promise.all([
    prisma.placeList.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
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
    }),
    prisma.placeList.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    limit: take,
    offset: skip,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const title = body?.title;
  const description = body?.description ?? null;
  const placeIds: unknown = body?.placeIds ?? [];

  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (typeof title !== "string" || !Array.isArray(placeIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (placeIds.length === 0) {
    return NextResponse.json({ error: "placeIds must not be empty" }, { status: 400 });
  }

  const places = await prisma.place.findMany({
    where: { id: placeIds as string[] },
  });

  if (places.length !== placeIds.length) {
    return NextResponse.json({ error: "One or more places not found" }, { status: 404 });
  }

  const placeList = await prisma.placeList.create({
    data: {
      userId: user.id,
      title,
      description,
      items: {
        create: (placeIds as string[]).map((placeId, index) => ({
          placeId,
          order: index,
        })),
      },
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

  return NextResponse.json(placeList, { status: 201 });
}
