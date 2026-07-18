"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/format";
import type { CommunityComment } from "@/lib/types";

/** PostCard가 "댓글 n" 아이콘을 눌렀을 때 펼치는 인라인 댓글 목록 + 작성창 (2.2). */
export function CommentSection({ postId, onCommentAdded }: { postId: number; onCommentAdded: () => void }) {
  const [comments, setComments] = useState<CommunityComment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 펼쳐질 때 한 번만 불러오는 마운트 시점 로드 — 폴링 대상이 아니다.
    fetch(`/api/community/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data: { items: CommunityComment[] }) => {
        if (!cancelled) setComments(data.items);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleSubmit = async () => {
    const content = draft.trim();
    if (!content) return;
    setSubmitting(true);
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setDraft("");
      const refreshed = await fetch(`/api/community/posts/${postId}/comments`).then((r) => r.json());
      setComments(refreshed.items);
      onCommentAdded();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3 border-t border-border-subtle pt-3">
      {comments === null && <p className="text-xs text-foreground-subtle">댓글 불러오는 중…</p>}
      {comments?.length === 0 && <p className="text-xs text-foreground-subtle">아직 댓글이 없어요.</p>}
      {comments?.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2 text-sm">
          <span className="shrink-0 text-base">{comment.authorBadge?.icon ?? "🙂"}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground-subtle">{comment.authorBadge?.title ?? "익명"}</p>
            <p className="text-foreground">{comment.content}</p>
          </div>
          <span className="shrink-0 text-xs text-foreground-subtle">{formatRelativeTime(comment.createdAt)}</span>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="댓글을 입력하세요"
          maxLength={300}
          className="min-w-0 flex-1 rounded-xl border border-border-subtle px-3 py-2 text-sm outline-none focus:border-brand"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <Button onClick={handleSubmit} disabled={submitting || !draft.trim()}>
          등록
        </Button>
      </div>
    </div>
  );
}
