"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/format";
import { CommentSection } from "@/components/community/CommentSection";
import type { CommunityPostSummary } from "@/lib/types";

/** design.md 커뮤니티 탭 — 게시글 카드(2.2). 작성자는 장착 배지(아이콘+제목)만 표시(F14 연장 적용). */
export function PostCard({
  post,
  onChanged,
  onDelete,
}: {
  post: CommunityPostSummary;
  onChanged: (next: Partial<CommunityPostSummary>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    const optimisticLiked = !post.likedByMe;
    const optimisticCount = post.likeCount + (optimisticLiked ? 1 : -1);
    onChanged({ likedByMe: optimisticLiked, likeCount: optimisticCount });

    const res = await fetch(`/api/community/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) {
      onChanged({ likedByMe: post.likedByMe, likeCount: post.likeCount });
      return;
    }
    const data: { liked: boolean; likeCount: number } = await res.json();
    onChanged({ likedByMe: data.liked, likeCount: data.likeCount });
  };

  const handleDelete = async () => {
    if (!confirm("이 게시글을 삭제할까요?")) return;
    setDeleting(true);
    const res = await fetch(`/api/community/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDelete();
    setDeleting(false);
  };

  return (
    <article className="space-y-3 rounded-2xl border border-border-subtle bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{post.authorBadge?.icon ?? "🙂"}</span>
          <span className="text-sm font-medium text-foreground-subtle">{post.authorBadge?.title ?? "익명"}</span>
        </div>
        <span className="text-xs text-foreground-subtle">{formatRelativeTime(post.createdAt)}</span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- signed URL이 5분 후 만료되는 동적 URL이라 next/image 캐시 대상이 아님 */}
      <img src={post.photoUrl} alt="인증샷" className="w-full rounded-xl border border-border-subtle object-cover" />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 font-medium ${post.likedByMe ? "text-danger-muted" : "text-foreground-muted"}`}
          >
            {post.likedByMe ? "❤️" : "🤍"} {post.likeCount}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 font-medium text-foreground-muted"
          >
            💬 {commentCount}
          </button>
        </div>
        {post.isMine && (
          <button onClick={handleDelete} disabled={deleting} className="text-xs text-danger-muted hover:underline">
            삭제
          </button>
        )}
      </div>

      {expanded && (
        <CommentSection postId={post.id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
      )}
    </article>
  );
}
