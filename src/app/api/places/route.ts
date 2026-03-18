import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const district = searchParams.get("district") ?? undefined;

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const take = Math.min(Number(limitParam) || 20, 50);
  const skip = Number(offsetParam) || 0;

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
              { newAddress: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {},
      district ? { district: { equals: district } } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.place.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.place.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    limit: take,
    offset: skip,
  });
}
