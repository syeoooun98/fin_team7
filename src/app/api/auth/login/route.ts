import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE_NAME } from "@/lib/auth";

/** POST /api/auth/login — PRD F1, 14.1 */
export async function POST(request: Request) {
  const { studentId, password } = await request.json();

  if (typeof studentId !== "string" || typeof password !== "string") {
    return NextResponse.json({ message: "학번과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { studentId } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: "학번 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ id: user.id, studentId: user.studentId });
  response.cookies.set(SESSION_COOKIE_NAME, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
