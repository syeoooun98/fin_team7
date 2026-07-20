import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/** DELETE /api/community/posts/[id] — 본인 게시글만 삭제 가능. 댓글/좋아요는 DB 레벨 cascade로 함께 삭제. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.communityPost.findUnique({ where: { id: Number(id) } });
  if (!post || post.userId !== userId) {
    return NextResponse.json({ message: "본인 게시글만 삭제할 수 있습니다." }, { status: 404 });
  }

  await prisma.communityPost.delete({ where: { id: post.id } });

  return NextResponse.json({ ok: true });
}
