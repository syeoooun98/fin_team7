// 자리지킴이 — 인증샷 Storage 유틸리티
// 버킷 "verification-photos"는 private(대시보드에서 public 아님으로 생성)이라 브라우저가 직접
// 접근할 수 없다. 업로드/조회 모두 이 서버 전용 서비스롤 클라이언트를 거치고, 클라이언트에는
// 항상 만료 있는 signed URL만 내려준다 — Report.photoPath/CommunityPost.photoPath에 저장하는
// 값은 공개 URL이 아니라 버킷 내부 오브젝트 경로다(F14 익명성 원칙 연장 적용).
import { createClient } from "@supabase/supabase-js";

const BUCKET = "verification-photos";
const SIGNED_URL_TTL_SECONDS = 300;

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다 (.env.example 참고)");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function extensionFor(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

/** 인증샷 업로드. 반환값은 signed URL이 아니라 버킷 내부 오브젝트 경로(DB에 저장할 값). */
export async function uploadVerificationPhoto(params: {
  userId: number;
  reportId: number;
  contentType: string;
  bytes: Uint8Array;
}): Promise<string> {
  const path = `${params.userId}/${params.reportId}-${Date.now()}.${extensionFor(params.contentType)}`;

  const { error } = await getServiceClient()
    .storage.from(BUCKET)
    .upload(path, params.bytes, { contentType: params.contentType, upsert: false });

  if (error) {
    throw new Error(`인증샷 업로드 실패: ${error.message}`);
  }

  return path;
}

/** photoPath(오브젝트 경로) → 만료 있는 열람 URL. null 입력이면 null 반환(배지 없는 좌석처럼 흔한 케이스). */
export async function getSignedPhotoUrl(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null;

  const { data, error } = await getServiceClient()
    .storage.from(BUCKET)
    .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}

/** 여러 개를 한 번에 — 커뮤니티 피드처럼 게시글 목록을 내려줄 때 N+1 signed URL 발급을 피하기 위한 배치 버전. */
export async function getSignedPhotoUrls(photoPaths: string[]): Promise<Record<string, string>> {
  if (photoPaths.length === 0) return {};

  const { data, error } = await getServiceClient()
    .storage.from(BUCKET)
    .createSignedUrls(photoPaths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}
