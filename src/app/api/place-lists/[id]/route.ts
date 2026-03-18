import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(_request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await prisma.placeList.findFirst({
    where: { id: context.params.id, userId: user.id },
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

  return NextResponse.json(list);
}
