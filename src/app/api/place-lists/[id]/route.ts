import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const list = await prisma.placeList.findUnique({
    where: {
      id: context.params.id,
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

  if (!list) {
    return NextResponse.json({ error: "Place list not found" }, { status: 404 });
  }

  return NextResponse.json(list);
}
