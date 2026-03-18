import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const placeId = (await context.params).id;

  const place = await prisma.place.findUnique({
    where: { id: placeId },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const existing = await prisma.placeLike.findUnique({
    where: {
      userId_placeId: {
        userId: user.id,
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
        userId: user.id,
        placeId,
      },
    });
    liked = true;
  }

  return NextResponse.json({
    liked,
  });
}
