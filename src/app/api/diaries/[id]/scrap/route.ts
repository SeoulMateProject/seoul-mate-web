import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);

  const userId = body?.userId;

  if (typeof userId !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const diaryId = context.params.id;

  const diary = await prisma.diary.findUnique({
    where: { id: diaryId },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  const existing = await prisma.diaryScrap.findUnique({
    where: {
      userId_diaryId: {
        userId,
        diaryId,
      },
    },
  });

  let scraped = false;

  if (existing) {
    await prisma.diaryScrap.delete({ where: { id: existing.id } });
  } else {
    await prisma.diaryScrap.create({
      data: {
        userId,
        diaryId,
      },
    });
    scraped = true;
  }

  return NextResponse.json({
    scraped,
  });
}
