"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/** 인증샷 업로드 성공 직후 뜨는 선택 팝업(2.1) — 공유는 완전히 선택사항이다. */
export function SharePromptModal({ reportId, onDone }: { reportId: number; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  const handleShare = async () => {
    setSubmitting(true);
    await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    onDone();
  };

  return (
    <Modal open onClose={onDone} title="공유하기" dismissible={false}>
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">이 순간을 커뮤니티와 나눌까요?</p>
        <p className="text-sm text-foreground-muted">
          공유하면 커뮤니티 피드에 인증샷이 게시돼요. 언제든 본인 게시글은 직접 삭제할 수 있어요.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onDone} disabled={submitting}>
            비공개 🔒
          </Button>
          <Button onClick={handleShare} disabled={submitting}>
            공유 😊
          </Button>
        </div>
      </div>
    </Modal>
  );
}
