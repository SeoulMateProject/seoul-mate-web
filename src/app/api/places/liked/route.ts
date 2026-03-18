import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const district = searchParams.get("district") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = {
    userId: user.id,
    place: {
      ...(district ? { district: { equals: district } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
              { newAddress: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {}),
    },
  };

  const [likes, total] = await Promise.all([
    prisma.placeLike.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        place: true,
      },
    }),
    prisma.placeLike.count({ where }),
  ]);

  return NextResponse.json({
    items: likes.map((l) => l.place),
    total,
    limit: take,
    offset: skip,
  });
}
