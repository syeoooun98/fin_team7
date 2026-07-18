import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { BADGE_DISPLAY_BY_CODE } from "@/lib/badges";
import type { BadgeCode, CommunityComment } from "@/lib/types";

const MAX_COMMENT_LENGTH = 300;

/** GET /api/community/posts/[id]/comments — 오래된 순(대화 흐름 그대로). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const comments = await prisma.communityComment.findMany({
    where: { postId: Number(id) },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { equippedBadgeCode: true } } },
  });

  const items: CommunityComment[] = comments.map((comment) => {
    const equippedCode = comment.user.equippedBadgeCode as BadgeCode | null;
    return {
      id: comment.id,
      authorBadge: equippedCode ? { code: equippedCode, ...BADGE_DISPLAY_BY_CODE[equippedCode] } : null,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isMine: comment.userId === userId,
    };
  });

  return NextResponse.json({ items });
}

/** POST /api/community/posts/[id]/comments — body: { content } */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const body = (await request.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();
  if (!content) {
    return NextResponse.json({ message: "댓글 내용을 입력해주세요." }, { status: 400 });
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ message: `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 작성해주세요.` }, { status: 400 });
  }

  const comment = await prisma.communityComment.create({ data: { postId, userId, content } });

  return NextResponse.json({ ok: true, commentId: comment.id });
}
