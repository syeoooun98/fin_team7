// 자리지킴이 — 인증샷이 배정된 미션(lib/missions.ts) 조건을 만족하는지 Vercel AI Gateway를
// 거쳐 Claude로 판별한다. AI 응답은 신뢰하되 파싱 실패 등 예외 상황에서는 통과시키지 않는다
// (미인증 사진으로 자리 복귀 처리되는 쪽보다, 실패 시 재촬영을 요구하는 쪽이 안전하다).
import { generateText, Output } from "ai";
import { z } from "zod";
import type { Mission } from "./missions";

const VERIFICATION_MODEL = "anthropic/claude-sonnet-5";

const RESULT_SCHEMA = z.object({
  passed: z.boolean(),
  reason: z.string().describe("한국어로 1문장, 통과/실패 이유"),
});

export interface PhotoVerificationResult {
  passed: boolean;
  reason: string;
}

export async function verifyMissionPhoto(
  bytes: Uint8Array,
  mission: Pick<Mission, "label" | "visionCheck">,
): Promise<PhotoVerificationResult> {
  try {
    const { output } = await generateText({
      model: VERIFICATION_MODEL,
      maxOutputTokens: 300,
      output: Output.object({ schema: RESULT_SCHEMA }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `이 사진은 "${mission.label}" 미션 인증샷이야. ` +
                `다음 조건을 만족해야 통과: ${mission.visionCheck}. ` +
                `조건을 만족하면 passed:true, 아니면 passed:false로 답하고 reason에 한국어로 짧게 이유를 설명해줘.`,
            },
            { type: "file", mediaType: "image", data: bytes },
          ],
        },
      ],
    });
    return output;
  } catch {
    return { passed: false, reason: "사진 확인 중 오류가 발생했어요. 다시 시도해주세요." };
  }
}
