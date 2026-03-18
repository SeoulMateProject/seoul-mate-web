import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const diary = await prisma.diary.findUnique({
    where: { id: context.params.id },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  return NextResponse.json(diary);
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);

  const title = body?.title;
  const content = body?.content;

  if (typeof title !== "string" && typeof content !== "string") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const diary = await prisma.diary.findUnique({
    where: { id: context.params.id },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
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
  const diary = await prisma.diary.findUnique({
    where: { id: context.params.id },
  });

  if (!diary) {
    return NextResponse.json({ error: "Diary not found" }, { status: 404 });
  }

  await prisma.diary.delete({
    where: { id: diary.id },
  });

  return NextResponse.json({}, { status: 204 });
}
