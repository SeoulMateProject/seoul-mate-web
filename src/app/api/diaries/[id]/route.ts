import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaUserFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const diary = await prisma.diary.findUnique({
    where: { id: (await context.params).id },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  const user = await getPrismaUserFromRequest(request);

  const liked = user
    ? await prisma.diaryLike
        .findUnique({
          where: {
            userId_diaryId: {
              userId: user.id,
              diaryId: diary.id,
            },
          },
        })
        .then((v) => Boolean(v))
    : false;

  const scrapped = user
    ? await prisma.diaryScrap
        .findUnique({
          where: {
            userId_diaryId: {
              userId: user.id,
              diaryId: diary.id,
            },
          },
        })
        .then((v) => Boolean(v))
    : false;

  return NextResponse.json({
    ...diary,
    liked,
    scrapped,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const title = body?.title;
  const content = body?.content;

  if (typeof title !== "string" && typeof content !== "string") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const diary = await prisma.diary.findUnique({
    where: { id: (await context.params).id },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  if (diary.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.diary.update({
    where: { id: diary.id },
    data: {
      title: typeof title === "string" ? title : diary.title,
      content: typeof content === "string" ? content : diary.content,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  // DELETE는 request 본문이 없더라도 인증을 위해 _request를 사용합니다.
  const request = _request;
  const user = await getPrismaUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const diary = await prisma.diary.findUnique({
    where: { id: (await context.params).id },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  if (diary.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.diary.delete({
    where: { id: diary.id },
  });

  return NextResponse.json({}, { status: 204 });
}
