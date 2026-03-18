import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const placeId = searchParams.get("placeId") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = {
    userId: user.id,
    ...(placeId ? { diary: { placeId } } : {}),
  };

  const [scraps, total] = await Promise.all([
    prisma.diaryScrap.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        diary: {
          include: {
            place: true,
          },
        },
      },
    }),
    prisma.diaryScrap.count({ where }),
  ]);

  return NextResponse.json({
    items: scraps.map((s) => s.diary),
    total,
    limit: take,
    offset: skip,
  });
}
