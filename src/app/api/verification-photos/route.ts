import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_BYTES, uploadVerificationPhoto } from "@/lib/supabase-storage";
import { getMission } from "@/lib/missions";
import { verifyMissionPhoto } from "@/lib/photo-verification";

/**
 * POST /api/verification-photos — 신고당한 본인이 배정된 미션(lib/missions.ts)에 맞춰 찍은
 * 인증샷 업로드. 업로드 직후 AI로 사진이 미션 조건을 만족하는지 검증하고, 통과한 경우에만
 * Report.verifiedPhotoPath를 채운다 — return-from-report는 이 값과 일치하는 photoPath만 받는다.
 * 신고 해제(return-from-report)와 분리된 업로드 엔드포인트다.
 */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const reportIdRaw = formData.get("reportId");
  const photo = formData.get("photo");

  const reportId = Number(reportIdRaw);
  if (!reportIdRaw || Number.isNaN(reportId)) {
    return NextResponse.json({ message: "reportId가 올바르지 않습니다." }, { status: 400 });
  }
  if (!(photo instanceof File)) {
    return NextResponse.json({ message: "사진 파일이 필요합니다." }, { status: 400 });
  }
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(photo.type)) {
    return NextResponse.json({ message: "jpg/png/webp 사진만 업로드할 수 있어요." }, { status: 400 });
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ message: "사진 용량은 5MB 이하만 가능해요." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { seatSession: true },
  });
  if (!report || report.status !== "ACTIVE" || report.seatSession.userId !== userId) {
    return NextResponse.json({ message: "진행 중인 신고를 찾을 수 없습니다." }, { status: 404 });
  }

  const mission = getMission(report.missionCode);
  if (!mission) {
    return NextResponse.json({ message: "이 신고에 배정된 미션을 찾을 수 없습니다." }, { status: 500 });
  }

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const { passed, reason } = await verifyMissionPhoto(bytes, mission);
  const photoPath = await uploadVerificationPhoto({ userId, reportId, contentType: photo.type, bytes });

  if (passed) {
    await prisma.report.update({ where: { id: reportId }, data: { verifiedPhotoPath: photoPath } });
  }

  return NextResponse.json({ photoPath, passed, reason });
}
