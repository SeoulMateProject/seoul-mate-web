import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);

  const userId = body?.userId;

  if (typeof userId !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const placeId = context.params.id;

  const place = await prisma.place.findUnique({
    where: { id: placeId },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const existing = await prisma.placeLike.findUnique({
    where: {
      userId_placeId: {
        userId,
        placeId,
      },
    },
  });

  let liked = false;

  if (existing) {
    await prisma.placeLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.placeLike.create({
      data: {
        userId,
        placeId,
      },
    });
    liked = true;
  }

  return NextResponse.json({
    liked,
  });
}
