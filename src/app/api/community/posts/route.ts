import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getSignedPhotoUrls } from "@/lib/supabase-storage";
import { BADGE_DISPLAY_BY_CODE } from "@/lib/badges";
import type { BadgeCode, CommunityPostSummary, CommunitySort } from "@/lib/types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

function parseSort(value: string | null): CommunitySort {
  if (value === "likes" || value === "comments") return value;
  return "recent";
}

/**
 * GET /api/community/posts?sort=recent|likes|comments&offset=&limit=
 * design.md 커뮤니티 탭 — 최신/인기(좋아요)/댓글순 무한 로딩 피드.
 */
export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sort = parseSort(searchParams.get("sort"));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));

  const orderBy =
    sort === "likes"
      ? { likes: { _count: "desc" as const } }
      : sort === "comments"
        ? { comments: { _count: "desc" as const } }
        : { createdAt: "desc" as const };

  const posts = await prisma.communityPost.findMany({
    orderBy,
    skip: offset,
    take: limit + 1,
    include: {
      user: { select: { equippedBadgeCode: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  const hasMore = posts.length > limit;
  const page = posts.slice(0, limit);
  const signedUrls = await getSignedPhotoUrls(page.map((p) => p.photoPath));

  const items: CommunityPostSummary[] = page.map((post) => {
    const equippedCode = post.user.equippedBadgeCode as BadgeCode | null;
    return {
      id: post.id,
      photoUrl: signedUrls[post.photoPath] ?? "",
      authorBadge: equippedCode ? { code: equippedCode, ...BADGE_DISPLAY_BY_CODE[equippedCode] } : null,
      createdAt: post.createdAt.toISOString(),
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByMe: post.likes.length > 0,
      isMine: post.userId === userId,
    };
  });

  return NextResponse.json({ items, hasMore });
}

/**
 * POST /api/community/posts — 인증샷 공유 팝업에서 "공유"를 선택했을 때만 호출된다.
 * body: { reportId } — 사진은 이미 return-from-report에서 report.photoPath로 저장되어 있어
 * 클라이언트가 다시 보낼 필요 없다. 신고 하나당 게시글은 최대 1개(스키마 unique).
 */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { reportId?: number } | null;
  const reportId = body?.reportId;
  if (!reportId) {
    return NextResponse.json({ message: "reportId가 필요합니다." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { seatSession: true, communityPost: true },
  });
  if (!report || report.seatSession.userId !== userId) {
    return NextResponse.json({ message: "본인의 신고 건이 아닙니다." }, { status: 404 });
  }
  if (!report.photoPath) {
    return NextResponse.json({ message: "인증샷이 없는 신고 건은 공유할 수 없습니다." }, { status: 400 });
  }
  if (report.communityPost) {
    return NextResponse.json({ message: "이미 공유된 게시글입니다." }, { status: 409 });
  }

  const post = await prisma.communityPost.create({
    data: { reportId, userId, photoPath: report.photoPath },
  });

  return NextResponse.json({ ok: true, postId: post.id });
}
