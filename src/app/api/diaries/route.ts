import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const placeId = searchParams.get("placeId") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = {
    AND: [placeId ? { placeId } : {}, userId ? { userId } : {}],
  };

  const [items, total] = await Promise.all([
    prisma.diary.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.diary.count({ where }),
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

  const userId = body?.userId;
  const placeId = body?.placeId;
  const title = body?.title;
  const content = body?.content;

  if (
    typeof userId !== "string" ||
    typeof placeId !== "string" ||
    typeof title !== "string" ||
    typeof content !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [user, place] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.place.findUnique({ where: { id: placeId } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const diary = await prisma.diary.create({
    data: {
      userId,
      placeId,
      title,
      content,
    },
  });

  return NextResponse.json(diary, { status: 201 });
}
