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
    where: { id: context.params.id, userId: user.id },
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
