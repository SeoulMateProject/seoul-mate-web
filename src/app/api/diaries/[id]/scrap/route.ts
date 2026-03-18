import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        userId: user.id,
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
        userId: user.id,
        diaryId,
      },
    });
    scraped = true;
  }

  return NextResponse.json({
    scraped,
  });
}
