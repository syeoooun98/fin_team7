"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** PRD F1, 14.1 — 학번 기반 자체 회원가입 로그인(SSO 미연동 확정) */
export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, password }),
    });

    setSubmitting(false);
    if (res.ok) {
      router.push("/");
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "로그인에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-neutral-600">학번</label>
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-neutral-600">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          required
        />
      </div>
      {error && <p className="text-sm text-danger-muted">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        로그인
      </Button>
      <p className="text-center text-sm text-neutral-500">
        계정이 없으신가요? <Link href="/signup" className="font-medium text-self-ring">회원가입</Link>
      </p>
    </form>
  );
}
