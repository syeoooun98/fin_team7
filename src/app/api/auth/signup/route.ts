import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, SESSION_COOKIE_NAME } from "@/lib/auth";

/** POST /api/auth/signup — PRD F1, 14.1: 학번 기반 자체 회원가입 */
export async function POST(request: Request) {
  const { studentId, password } = await request.json();

  if (typeof studentId !== "string" || typeof password !== "string" || !studentId || !password) {
    return NextResponse.json({ message: "학번과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { studentId } });
  if (existing) {
    return NextResponse.json({ message: "이미 가입된 학번입니다." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { studentId, passwordHash: hashPassword(password) },
  });

  const response = NextResponse.json({ id: user.id, studentId: user.studentId }, { status: 201 });
  response.cookies.set(SESSION_COOKIE_NAME, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
