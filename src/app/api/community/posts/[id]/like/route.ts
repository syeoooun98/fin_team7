import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/** POST /api/community/posts/[id]/like — 좋아요 토글(이미 눌렀으면 취소). */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const postId = Number(id);
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.communityLike.create({ data: { postId, userId } });
  }

  const likeCount = await prisma.communityLike.count({ where: { postId } });

  return NextResponse.json({ liked: !existing, likeCount });
}
