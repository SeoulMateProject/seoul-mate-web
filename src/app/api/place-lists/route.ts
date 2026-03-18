import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("userId") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = userId ? { userId } : {};

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
