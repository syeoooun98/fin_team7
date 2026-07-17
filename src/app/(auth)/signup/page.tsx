"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** PRD F1, 14.1 — 자체 회원가입(학번 + 비밀번호). 학교 SSO 연동 없음. */
export default function SignupPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, password }),
    });

    setSubmitting(false);
    if (res.ok) {
      router.push("/login");
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "회원가입에 실패했습니다.");
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
        회원가입
      </Button>
      <p className="text-center text-sm text-neutral-500">
        이미 계정이 있으신가요? <Link href="/login" className="font-medium text-self-ring">로그인</Link>
      </p>
    </form>
  );
}
