import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const place = await prisma.place.findUnique({
    where: {
      id: context.params.id,
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json(place);
}
