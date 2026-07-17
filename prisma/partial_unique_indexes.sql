-- 자리지킴이 — 부분 유니크 인덱스 (Prisma 스키마 DSL이 지원하지 않는 WHERE절 unique index)
--
-- 적용 방법: `npx prisma db push` 또는 `npx prisma migrate dev` 실행 직후, 이 파일을 그대로
-- psql/DB 클라이언트로 한 번 실행한다. (`prisma migrate dev --create-only`로 마이그레이션 파일을
-- 만든 뒤 이 SQL을 그 파일에 붙여넣으면 이후 `prisma migrate deploy`에도 자동 포함된다.)
--
-- 절대 생략 금지 — 아래 3개가 없으면 PRD F3(1인 1좌석), F13(좌석당 활성 신고 1건)이
-- 애플리케이션 코드의 실수 하나로 깨질 수 있다 (DB.md 9.2 동시성 요구사항 참고).

-- (DB.md 2.5) 좌석당 활성 세션은 1개뿐 — 동시 체크인 방지
CREATE UNIQUE INDEX IF NOT EXISTS ux_seat_sessions_active_seat
  ON seat_sessions (seat_id) WHERE checked_out_at IS NULL;

-- (DB.md 2.5) 이용자당 활성 세션은 1개뿐 — F3: 1인 1좌석
CREATE UNIQUE INDEX IF NOT EXISTS ux_seat_sessions_active_user
  ON seat_sessions (user_id) WHERE checked_out_at IS NULL;

-- (DB.md 2.6) 세션당 활성 자리비움은 1개뿐
CREATE UNIQUE INDEX IF NOT EXISTS ux_away_periods_active_session
  ON away_periods (seat_session_id) WHERE ended_at IS NULL;

-- (DB.md 2.7) 세션당 활성 신고는 1건뿐 — F13
CREATE UNIQUE INDEX IF NOT EXISTS ux_reports_active_session
  ON reports (seat_session_id) WHERE status = 'ACTIVE';
