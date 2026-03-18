import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const place = await prisma.place.findUnique({
    where: {
      id: (await context.params).id,
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const user = await getPrismaUserFromRequest(request);
  const liked = user
    ? await prisma.placeLike
        .findUnique({
          where: {
            userId_placeId: {
              userId: user.id,
              placeId: place.id,
            },
          },
        })
        .then((v) => Boolean(v))
    : false;

  return NextResponse.json({
    ...place,
    liked,
  });
}
