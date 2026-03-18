import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getUserFromRequest(request);

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

  const existing = await prisma.diaryLike.findUnique({
    where: {
      userId_diaryId: {
        userId: user.id,
        diaryId,
      },
    },
  });

  let liked = false;

  if (existing) {
    await prisma.$transaction([
      prisma.diaryLike.delete({ where: { id: existing.id } }),
      prisma.diary.update({
        where: { id: diaryId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.diaryLike.create({
        data: {
          userId: user.id,
          diaryId,
        },
      }),
      prisma.diary.update({
        where: { id: diaryId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      }),
    ]);
    liked = true;
  }

  const updated = await prisma.diary.findUnique({
    where: { id: diaryId },
  });

  return NextResponse.json({
    liked,
    diary: updated,
  });
}
