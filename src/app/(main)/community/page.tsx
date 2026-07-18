"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard } from "@/components/community/PostCard";
import type { CommunityPostSummary, CommunitySort } from "@/lib/types";

const PAGE_SIZE = 10;

const SORT_TABS: { value: CommunitySort; label: string }[] = [
  { value: "recent", label: "최신" },
  { value: "likes", label: "인기" },
  { value: "comments", label: "댓글" },
];

/** design.md 커뮤니티 탭 — 정렬 필터 + 아래로 스크롤 시 무한 로딩. */
export default function CommunityPage() {
  const [sort, setSort] = useState<CommunitySort>("recent");
  const [posts, setPosts] = useState<CommunityPostSummary[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (currentSort: CommunitySort, offset: number) => {
    setLoading(true);
    const res = await fetch(`/api/community/posts?sort=${currentSort}&offset=${offset}&limit=${PAGE_SIZE}`);
    if (res.ok) {
      const data: { items: CommunityPostSummary[]; hasMore: boolean } = await res.json();
      setPosts((prev) => (offset === 0 ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // 정렬 탭이 바뀔 때마다 목록을 처음부터 다시 불러오는 최초 로드 패턴.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(sort, 0);
  }, [sort, loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPage(sort, posts.length);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadPage, sort, posts.length]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Community</p>
        <h1 className="text-2xl font-bold text-foreground">인증샷 커뮤니티</h1>
      </div>

      <div className="flex gap-1 rounded-full border border-border-subtle bg-surface-soft p-1 w-fit">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSort(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              sort === tab.value ? "bg-white text-brand shadow-[0_2px_10px_-4px_rgba(124,58,237,0.5)]" : "text-foreground-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <p className="rounded-2xl border border-border-subtle bg-white p-6 text-center text-sm text-foreground-muted">
          아직 공유된 인증샷이 없어요.
        </p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChanged={(next) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...next } : p)))}
            onDelete={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />
      {loading && <p className="text-center text-sm text-foreground-subtle">불러오는 중…</p>}
    </div>
  );
}
