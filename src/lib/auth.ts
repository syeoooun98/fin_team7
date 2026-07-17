// 자리지킴이 — 최소 인증/세션 유틸리티 (PRD F1, 14.1: 자체 회원가입, 학번+비밀번호)
//
// 주의: 이건 NextAuth/Lucia/iron-session 같은 검증된 라이브러리를 넣기 전까지 쓰는
// 최소 구현이다. 비밀번호는 salt를 붙인 scrypt 해시로 저장하고, 세션 쿠키는
// HMAC으로 서명해 위조를 막는다(서명 없는 평문 user-id 쿠키는 인증 우회 취약점이 되므로 금지).
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되지 않았습니다 (.env.example 참고)");
  }
  return secret;
}

export const SESSION_COOKIE_NAME = "jarizikimi_session";

/** userId를 HMAC-SHA256으로 서명해 "userId.signature" 형태의 쿠키 값을 만든다 */
export function signSession(userId: number): string {
  const signature = createHmac("sha256", getSessionSecret()).update(String(userId)).digest("hex");
  return `${userId}.${signature}`;
}

/** 쿠키 값을 검증해 userId를 반환한다. 서명이 안 맞으면 null(위조 시도로 간주). */
export function verifySession(cookieValue: string | undefined): number | null {
  if (!cookieValue) return null;
  const [userIdRaw, signature] = cookieValue.split(".");
  if (!userIdRaw || !signature) return null;

  const expected = createHmac("sha256", getSessionSecret()).update(userIdRaw).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return null;
  }
  return Number(userIdRaw);
}

/** 라우트 핸들러/서버 컴포넌트에서 현재 로그인 사용자 id를 읽는다. 비로그인이면 null. */
export async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
