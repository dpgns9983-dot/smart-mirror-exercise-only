# 변경 이력 (Changelog)

이 파일은 PC1 Smart Mirror UI 의 모든 주요·세부 변경 사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/) 를 따르고, 커밋은 [Conventional Commits](https://www.conventionalcommits.org/) 스타일을 사용합니다.

작은 작업까지 빠짐없이 남기기 위해 다음 두 시점으로 정리되어 있습니다.

1. **버전별 요약** — 사용자가 체감하는 변화 기준 (Added / Changed / Fixed / Removed)
2. **개발 히스토리 (커밋 단위)** — 어느 날 어떤 파일에 무엇이 들어갔는지 빠짐없이 기록

---

## [0.1.0] - 2026-05-22

발표 직후 포트폴리오용으로 저장소를 정리한 첫 공개 버전입니다.
초기 커밋부터 정리 커밋까지 총 28개의 커밋이 누적되었습니다.

### Added (추가)

#### 화면 & 흐름
- 프로필 선택 화면 ([src/pages/ProfileSelectPage.tsx](src/pages/ProfileSelectPage.tsx))
  - 등록된 프로필 카드 목록, 새 프로필 만들기, 마지막 사용 프로필 자동 선택
  - 프로필별 사진 (`profilePhoto` 로컬 저장)과 마지막 사용 시각 표시
- 기본 정보 입력 화면 ([src/pages/ProfileInputPage.tsx](src/pages/ProfileInputPage.tsx))
  - 키·몸무게·운동 목표·경험 수준·주간 운동 빈도·신체 제약 입력
  - 옵션 라벨은 한글 (`GOAL_OPTIONS`, `EXPERIENCE_OPTIONS`, `FREQUENCY_OPTIONS`, `LIMITATION_OPTIONS`)
- 기준 촬영 화면 ([src/pages/BaselineSetupPage.tsx](src/pages/BaselineSetupPage.tsx))
  - 얼굴 정면 / 전신 정면 두 슬롯(`face_front`, `body_front_full`) 촬영
  - 촬영 가이드, 슬롯별 완료 상태, 재촬영 흐름
- 모드/오늘 루틴 화면 ([src/pages/ModePage.tsx](src/pages/ModePage.tsx))
  - 월간 캘린더(`getRoutineCalendar`)와 오늘 루틴 카드
  - 루틴 자동 준비 상태(`generating → ready`)에 따른 CTA 문구 전환
  - 루틴 이유 카드 3종 (포커스/난이도/근거)
- 운동 세션 화면 ([src/pages/SessionPage.tsx](src/pages/SessionPage.tsx))
  - 카메라 풀스크린 배경 + 양측 그라디언트 플로팅 패널 레이아웃
  - 좌측 운동 정보 / 우측 진행 상태 60·40 분할
  - 휴식 타이머(`RestTimer`, 기본 45초)
  - WebSocket 기반 실시간 카운트·자세 오류·대상 인식 상태 수신
  - 운동 상태 머신: `idle → starting → running → stopping → pending_result → coaching → rest → skipping`
  - 대상 손실/다중 인식 시 프레임 업로드 차단 (`BLOCKING_TARGETS`)
- 결과 리포트 화면 ([src/pages/ResultPage.tsx](src/pages/ResultPage.tsx))
  - 8개 패널 구성: 핵심 지표, 자세 분석, 코칭 메시지, 안전 경보, 근거(Evidence), 운동별 요약, 비교 설명, 다음 권장
  - 운동 카드 갯수에 따른 그리드 자동 최적화
  - 안전 등급(`safe / caution / danger / neutral`) 자동 판정
- 운동 이력 화면 ([src/pages/HistoryPage.tsx](src/pages/HistoryPage.tsx))
  - 월간 캘린더 + 날짜별 운동 결과·코칭 로그 그룹화
  - 날짜별 메모(`dayNotes`) 작성·저장
- 라우팅 & 가드 ([src/App.tsx](src/App.tsx))
  - `/profile-select`, `/baseline-check`, `/baseline-setup`, `/mode`, `/session`, `/result`, `/history`
  - 프로필·기본 정보·기준 촬영 상태에 따른 진입 가드 (`GuardedProfileInput` 등)
  - `/camera` → `/session` 호환 리다이렉트

#### 공통 컴포넌트
- 앱 셸 ([src/components/AppShell.tsx](src/components/AppShell.tsx)) — 공통 헤더/푸터 레이아웃
- 뒤로가기 버튼 ([src/components/BackButton.tsx](src/components/BackButton.tsx))
- 휴식 타이머 ([src/components/RestTimer.tsx](src/components/RestTimer.tsx))
- 윈도우 컨트롤 ([src/components/WindowControls.tsx](src/components/WindowControls.tsx)) — 풀스크린 환경의 최소/최대/닫기

#### 카메라 & 상태
- 카메라 훅 ([src/hooks/useCamera.ts](src/hooks/useCamera.ts))
  - 1280×720 전면 카메라 요청, 권한/연결 상태 (`idle/requesting/ready/denied/unavailable/error`)
  - `capture(quality)` 로 JPEG Blob 캡처, 컴포넌트 언마운트 시 자동 정리
- 앱 컨텍스트 ([src/state/AppContext.tsx](src/state/AppContext.tsx))
  - 프로필 목록 / 활성 프로필 / 선택된 루틴·요일 / 운동 실행 상태 / 마지막 결과
  - 마지막 프로필 ID 를 `localStorage` (`smart-mirror.pc1.lastProfileId`) 에 저장·복원

#### API 서비스
- PC3 API 클라이언트 ([src/services/api.ts](src/services/api.ts))
  - `VITE_PC3_URL` 환경 변수 기반, Tauri 런타임 감지 → `@tauri-apps/plugin-http` 사용으로 CORS 우회
  - `ApiError` 커스텀 에러 + 한글 친화 메시지 (`friendlyError`)
  - 주요 호출: `getProfiles`, `upsertProfile`, `generateRoutine`, `getRoutineDay`, `getRoutineCalendar`, `startSession`, `stopSession`, `skipSession`, `uploadFrame`, `getSessionResult`, `getProgress`, `getCoachLogs`, `getBaselineStatus`
  - 응답을 PC1 도메인 타입(`UserProfile`, `RoutineBundle`, `SessionFinalResponse` …) 으로 정규화

#### 로컬 저장
- 프로필 사진 ([src/services/profilePhoto.ts](src/services/profilePhoto.ts))
  - 프로필별 key prefix `smart-mirror.pc1.profilePhoto.`
  - `getProfilePhoto`, `saveProfilePhoto`, `removeProfilePhoto`
- 일자별 메모 ([src/services/dayNotes.ts](src/services/dayNotes.ts))
  - 프로필별 key prefix `smart-mirror.pc1.dayNotes`
  - `readDayNotes`, `readDayNote`, `saveDayNote`, `dayNotePreview`

#### 한글화 & 포맷 유틸
- 포맷 유틸 ([src/utils/format.ts](src/utils/format.ts))
  - 운동 라벨 5종(`squat/jumping_jack/knee_raise/lunge/pushup`) 한글 매핑
  - 자세 오류 라벨(`POSTURE_ERROR_LABELS`) — `knee_valgus → 무릎 안쪽 무너짐` 등 16종
  - 대상 인식 상태(`TARGET_STATUS_LABELS`) — `target_lost → 대상 놓침` 등 6종
  - 측정 품질(`MEASUREMENT_QUALITY_LABELS`), 코치 목적(`COACH_PURPOSE_LABELS`), 카테고리 라벨
  - 날짜 유틸: `todayIso`, `offsetDate`, `monthStartIso`, `monthEndIso`, `shortDate`
- 코칭 카피 ([src/utils/coachingCopy.ts](src/utils/coachingCopy.ts))
  - 안전 등급 판정(`resolveSafetyLevel`) — 위험 키워드 6종 감지
  - 등급별 긍정/개선 문구 생성(`composePositiveLine`, `composeImprovementLines`)
  - 코치 로그 제목·본문 합성(`composeCoachLogTitle`, `composeCoachLogBody`)
  - 영문/스네이크 잔재 일괄 치환(`RAW_TEXT_REPLACEMENTS` 16종)

#### 도메인 타입
- 도메인 타입 정의 ([src/types/domain.ts](src/types/domain.ts))
  - 사용자/프로필: `UserProfile`, `ProfileStatus`, `BaselineSlot`
  - 운동: `ExerciseType`, `ExerciseGoal`, `ExperienceLevel`, `WeeklyFrequency`, `Limitation`
  - 루틴: `RoutineDay`, `RoutineBundle`, `RoutineCalendar`, `WeeklyRoutineExercise`, `WeeklyAdjustment`
  - 세션·결과: `SessionStartResponse`, `SessionFinalResponse`, `ExerciseUpdate`, `WorkoutResult`, `CoachingPayload`, `CoachLog`, `EvidenceItem`
  - 이력: `ProgressResponse`, `ProgressSummary`, `BodyMetricRecord`

#### 데스크톱 셸 (Tauri)
- Tauri 2 설정 ([src-tauri/tauri.conf.json](src-tauri/tauri.conf.json))
  - 풀스크린, 데코레이션 없음, 리사이즈 비활성 (`Smart Mirror` 창)
  - NSIS 번들, 현재 사용자 설치(`currentUser`), 커스텀 설치 훅 [src-tauri/nsis-hooks.nsh](src-tauri/nsis-hooks.nsh)
  - 아이콘: `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`
- HTTP 플러그인 등록 ([src-tauri/src/lib.rs](src-tauri/src/lib.rs)) — `tauri_plugin_http::init()`
- 권한 manifest ([src-tauri/capabilities/default.json](src-tauri/capabilities/default.json))
- Rust 툴체인 고정 ([rust-toolchain.toml](rust-toolchain.toml))

#### 빌드 자동화
- 1-클릭 NSIS 설치 파일 빌더 ([Build-PC1-Installer.cmd](Build-PC1-Installer.cmd))
  - `node_modules` 부재 시 자동 `npm ci`
  - `.env` 의 `VITE_PC3_URL` 확인 메시지
  - `npm run tauri -- build` 실행 후 최신 `*.exe` 를 프로젝트 폴더에 `SmartMirror-PC1-Setup.exe` 로 복사

#### 스타일 & 환경
- 글로벌·레이아웃·화면 스타일 ([src/styles/global.css](src/styles/global.css), [src/styles/layout.css](src/styles/layout.css), [src/styles/screens.css](src/styles/screens.css))
- Node 버전 힌트 ([.nvmrc](.nvmrc))
- 환경 변수 템플릿 ([.env.example](.env.example))

#### 문서
- 포트폴리오용 README ([README.md](README.md))
  - 위쪽: 소개, 시스템 구조도, 화면 흐름, 기술 스택, 학습 포인트
  - 아래쪽: 비전공자 가이드 (사전 준비 → clone → install → `.env` → 개발 실행 → 설치파일 빌드 → 설치/실행 경로 → FAQ)
- 변경 이력 ([CHANGELOG.md](CHANGELOG.md)) — 본 문서

### Changed (변경)
- 결과 화면을 처음에는 10패널 → 8패널로 슬림화하고, 다시 카드 갯수에 따라 자동 그리드로 재편
- 운동·휴식 화면을 60/40 좌우 분할 → 카메라 풀스크린 배경 + 양측 그라디언트 패널 → 검증 후 일부 복원
- 자세 오류·운동 중 상태 문구를 영문 스네이크 형태에서 한글로 일괄 정규화 ([src/utils/format.ts](src/utils/format.ts), [src/utils/coachingCopy.ts](src/utils/coachingCopy.ts))
- 루틴 준비 상태에 따라 CTA 버튼 문구가 자연스럽게 바뀌도록 UX 정비 ([src/pages/ModePage.tsx](src/pages/ModePage.tsx))
- 결과 화면 코칭 톤 정비 및 안전 경보 도입 ([src/pages/ResultPage.tsx](src/pages/ResultPage.tsx))
- BackButton 의 시각 위계/터치 영역 조정 ([src/components/BackButton.tsx](src/components/BackButton.tsx))
- AppShell 의 임시 데모 버튼 영역 제거 후 정리 ([src/components/AppShell.tsx](src/components/AppShell.tsx))
- Tauri capability JSON 권한 범위 정리 ([src-tauri/capabilities/default.json](src-tauri/capabilities/default.json))

### Fixed (수정)
- 루틴이 자동으로 준비되지 않던 문제 보정 (`fix: 루틴 자동 준비와 결과 화면 톤 정리`)
- 결과 화면의 영문 자세 오류가 그대로 노출되던 문제 한글화 (`fix: 결과 화면 자세오류 한글화 및 비교 설명 강화`)
- 운동 중 상태 문구가 환경마다 다르게 표시되던 문제 정규화 (`fix: 운동 중 상태 문구 한글화 정규화`)
- 임시 UI 버튼이 일부 화면에서 노출되지 않던 문제 보정 (`fix: 임시 버튼 전역 노출 보정`)

### Removed (제거)
- 발표용 흐름 문서 `PPT_FLOW_SUMMARY_KO.md`
- 개발 중 사용하던 수동 API 테스트 파일 `test-api.http`
- PC3 연결 점검 스크립트 `scripts/api_probe.mjs`
- 데모용 화면 전역 임시 UI 버튼 (`chore: 임시 UI 버튼 제거`)
- 옛 산출물·메모 파일들: `FLOW_CHANGES.md`, `PC1_ONLY_FLOW_KO.md`, `RESULT_DATA_GUIDE_KO.md`, `SKILL.md`, `Untitled-1.txt`, `api_check.py`, `profile-select-alternatives.svg`, `profile-select-wide-preview.svg`, 이전 `SmartMirror-PC1-Setup.exe` 바이너리
- Git 추적에서 로컬 환경 파일 `.env` 제외 (저장소엔 `.env.example` 만 유지)

### Security (보안)
- `.env` (개인 LAN IP 포함) 를 `.gitignore` 에 추가하고 `git rm --cached .env` 로 추적 해제
- 풀스크린·데코레이션 비활성·리사이즈 비활성으로 설치형 키오스크 환경에서 의도치 않은 창 조작 차단

---

## 개발 히스토리 (커밋 단위, 시간순)

> "체인지 로그는 길어야 한다" 는 요청에 따라, 모든 커밋을 작은 작업까지 빠짐없이 기록합니다.

### 2026-05-20

#### `4127cd3` — Initial commit: pc1 as main repository
- PC1 저장소를 단일 패키지로 초기 커밋. 총 47개 파일, 13,550줄 추가
- 프로젝트 골격: [package.json](package.json), [tsconfig.json](tsconfig.json), [tsconfig.node.json](tsconfig.node.json), [vite.config.ts](vite.config.ts), [index.html](index.html), [.gitignore](.gitignore), [.env.example](.env.example)
- React 19 / Vite 7 / TS 5.8 / React Router 7 / Tauri 2 / `@tauri-apps/plugin-http` 의존성
- React 진입점: [src/main.tsx](src/main.tsx), [src/App.tsx](src/App.tsx) (라우팅 + 가드)
- 페이지 7종: `ProfileSelectPage`, `ProfileInputPage`, `BaselineSetupPage`, `ModePage`, `SessionPage`, `ResultPage`, `HistoryPage`
- 공통 컴포넌트 4종: `AppShell`, `BackButton`, `RestTimer`, `WindowControls`
- 훅 1종: `useCamera` (전면 카메라 + JPEG 캡처)
- 서비스: `api.ts` (585줄, PC3 클라이언트) — `dayNotes.ts`, `profilePhoto.ts` 는 후속 커밋에서 추가
- 상태: `AppContext.tsx` (154줄)
- 도메인 타입: `domain.ts` (252줄)
- 유틸: `format.ts` (206줄, 한글 라벨 매핑) — `coachingCopy.ts` 는 다음 커밋
- 스타일 3종: `global.css` (150줄), `layout.css` (231줄), `screens.css` (1805줄)
- Tauri 셸: [src-tauri/Cargo.toml](src-tauri/Cargo.toml), [src-tauri/build.rs](src-tauri/build.rs), [src-tauri/src/lib.rs](src-tauri/src/lib.rs), [src-tauri/src/main.rs](src-tauri/src/main.rs), [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json), `capabilities/default.json`, `nsis-hooks.nsh`, 아이콘(`icon.icns`, `icon.ico`)
- 빌드 스크립트: [Build-PC1-Installer.cmd](Build-PC1-Installer.cmd) (64줄)
- 기존 문서: `README.md` (93줄), `CHANGELOG.md` (207줄, 이후 재작성), `FLOW_CHANGES.md`, `SKILL.md`

#### `0143439` — feat(pc1): 결과 화면 코칭 톤 + 안전 경보 도입
- `src/utils/coachingCopy.ts` 신규 (188줄) — 안전 등급 판정, 긍정/개선 문구 합성
- `src/pages/ResultPage.tsx` 코칭 톤 적용 (+76/−21)
- `src/styles/screens.css` 안전 경보 스타일 (+27)

#### `076ce2f` — feat: 결과화면 상세 데이터 표시 및 API 수동 테스트 경로 추가
- `src/pages/ResultPage.tsx` 상세 데이터 표시 (+120/−62)
- `src/styles/screens.css` 상세 영역 스타일 (+141/−16)
- `test-api.http` 신규 (수동 API 테스트, 64줄)

#### `da4a91d` — refactor: 결과화면 핵심 정보만 남기고 실호출 데이터 점검 추가
- `src/pages/ResultPage.tsx` 핵심 정보 위주로 축소 (−98 net)
- `src/styles/screens.css` 레이아웃 재정비 (208줄 영역 변경)
- `scripts/api_probe.mjs` 신규 (PC3 핑 점검, 104줄)

#### `4679e65` — docs: 결과 데이터 비전공자 가이드 추가
- `RESULT_DATA_GUIDE_KO.md` 신규 (145줄, 이후 정리에서 삭제)

#### `97ecf42` — docs: 결과 데이터 기반 패널 10종 정리
- `RESULT_DATA_GUIDE_KO.md` 패널 10종 정리 추가 (+81)

#### `f2b89e2` — feat: 결과화면 개선 패널 3종 구현
- `src/pages/ResultPage.tsx` 개선 패널 3종 (+60)
- `src/styles/screens.css` 패널 스타일 (+126)

#### `f4a2915` — feat: 결과화면 10패널 전체 구성 적용
- `src/pages/ResultPage.tsx` 10패널 구성 (+177)
- `src/styles/screens.css` 패널별 스타일 (+137)

#### `2472cec` — refactor: 결과화면 패널 4·9 제거 및 8패널 재배치
- `src/pages/ResultPage.tsx` 4·9번 패널 제거, 8패널로 재배치 (−72 net)
- `src/styles/screens.css` 그리드 정리

#### `dd4dab8` — fix: 운동 중 상태 문구 한글화 정규화
- `src/pages/SessionPage.tsx` 상태 문구 한글 정규화 (+11/−3)
- `src/utils/format.ts` 정규화 헬퍼 보강 (+10/−2)

#### `88095a6` — fix: 결과 화면 자세오류 한글화 및 비교 설명 강화
- `src/pages/ResultPage.tsx` 자세 오류 한글화 + 비교 설명 (+7)
- `src/utils/format.ts` 자세 오류 라벨 추가 (+3)

#### `1de05b6` — feat: 루틴 준비 화면 자연스러운 상태 UX 개선
- `src/pages/ModePage.tsx` 대규모 개편 (+216/−84) — 상태별 표시 분기
- `src/styles/screens.css` 상태 UI 스타일 (+90)

#### `98ec0d2` — feat: 루틴 준비 상태 CTA 문구 추가
- `src/pages/ModePage.tsx` 준비 상태 CTA 문구 (+3)
- `src/styles/screens.css` CTA 강조 스타일 (+11)

#### `1020a8b` — fix: 루틴 자동 준비와 결과 화면 톤 정리
- `src/services/dayNotes.ts` 신규 (53줄) — 일자별 메모 저장
- `src/services/profilePhoto.ts` 신규 (65줄) — 프로필 사진 저장
- `src/pages/HistoryPage.tsx` 리팩토링 (+101) — 메모/사진 통합
- `src/pages/ModePage.tsx` 자동 준비 흐름 보정 (+109)
- `src/pages/BaselineSetupPage.tsx` 가드 정비 (+58)
- `src/utils/coachingCopy.ts` 톤 정리 (+215)
- `src/utils/format.ts` 라벨 확장 (+33)
- `src/components/BackButton.tsx` 시각/터치 영역 (+22)
- `src/pages/ProfileSelectPage.tsx`, `src/pages/ResultPage.tsx` 톤 일치
- `api_check.py` 추가 (개발용, 후속 정리에서 삭제)

#### `00633dc` — chore: pc1 기준 전체 파일로 저장소 초기화
- `.nvmrc`, `rust-toolchain.toml` 추가 (재현성)
- `src/pages/ResultPage.tsx` 전반 정비 (+276/−161)
- `profile-select-alternatives.svg`, `profile-select-wide-preview.svg` 디자인 시안 추가 (이후 정리)
- `Untitled-1.txt` 임시 파일 추가 (이후 정리)

#### `44334dd` — chore: 배포 산출물 준비와 발표용 흐름 문서 정리
- `SmartMirror-PC1-Setup.exe` 1.92MB 바이너리 추가 (이후 정리)
- `PPT_FLOW_SUMMARY_KO.md` 신규 (107줄)
- `src/styles/screens.css` 발표용 스타일 보강 (+223)
- `api_check.py`, `Untitled-1.txt`, 시안 SVG 정리

#### `a78bf31` — docs: PC1 전용 구조 흐름 문서 분리
- `PC1_ONLY_FLOW_KO.md` 신규 (56줄, 이후 정리)

#### `d9d9bef` — docs: PPT에 빌드 설치 연결 절차 추가
- `PPT_FLOW_SUMMARY_KO.md` 빌드/설치 절차 섹션 (+47)

#### `521d324` — feat: 전 화면 임시 UI 버튼 추가
- `src/components/AppShell.tsx` 임시 데모 버튼 슬롯 (+9)
- `src/styles/layout.css` 임시 버튼 스타일 (+14)

#### `d94d4f7` — fix: 임시 버튼 전역 노출 보정
- `src/App.tsx` 임시 버튼 전역 렌더링 보정 (+36)
- `src/components/AppShell.tsx` 슬롯 정리 (−9)

#### `1f38c4d` — feat: 임시 버튼 데모 자동 진행 기능 추가
- `src/App.tsx` 데모 자동 진행 (+22/−2)

#### `ccda5d8` — chore: 임시 UI 버튼 제거
- `src/App.tsx` 임시 버튼 일괄 제거 (+2/−34)
- `src/styles/layout.css` 관련 스타일 제거 (−14)

### 2026-05-21

#### `f66c937` — feat: 결과화면 운동 카드 갯수별 레이아웃 최적화
- `src/pages/ResultPage.tsx` 카드 갯수별 그리드 자동 최적화 (+332)
- `src/styles/screens.css` 카드 그리드 변형 (+398)

#### `9173d87` — feat: 운동·휴식 화면 60/40 좌우 분할 레이아웃 전환
- `src/pages/SessionPage.tsx` 60/40 좌우 분할 (+133)
- `src/components/RestTimer.tsx` 분할 레이아웃 대응 (+40)
- `src/styles/screens.css` 분할 스타일 (+153)

#### `f192f4e` — feat: 운동·휴식 화면 카메라 배경 + 양측 그라디언트 플로팅 패널
- `src/pages/SessionPage.tsx` 카메라 풀스크린 배경 + 플로팅 패널 (+29)
- `src/components/RestTimer.tsx` 플로팅 패널 톤 (+8)
- `src/styles/screens.css` 그라디언트 패널 (+77)

#### `30ee446` — revert: 운동·휴식 화면 레이아웃 변경 이전으로 복원
- 직전 두 커밋(`9173d87`, `f192f4e`) 시각 변경을 검증 후 일부 복원
- `src/pages/SessionPage.tsx`, `src/components/RestTimer.tsx`, `src/styles/screens.css` 롤백

#### `f5cbd95` — chore: 불필요 문서 삭제 및 전반 코드 업데이트
- 옛 문서 일괄 정리: `FLOW_CHANGES.md` (430줄), 이전 `CHANGELOG.md` (513줄), `PC1_ONLY_FLOW_KO.md` (56줄), `RESULT_DATA_GUIDE_KO.md` (226줄), `SKILL.md` (10줄), `PPT_FLOW_SUMMARY_KO.md` 본문 축소
- 산출물 바이너리 `SmartMirror-PC1-Setup.exe` 제거 (Git LFS 미사용 정책)
- `README.md` 정비 (+132)
- Tauri 의존성 업데이트: `src-tauri/Cargo.lock` (+545), `src-tauri/Cargo.toml` (+1), `src-tauri/src/lib.rs` (+1)
- `src-tauri/capabilities/default.json` 권한 범위 정리 (+10)
- 전 페이지 자잘한 톤·문구 정리: `BaselineSetupPage.tsx` (+226 net), `HistoryPage.tsx`, `ModePage.tsx`, `ProfileInputPage.tsx`, `ProfileSelectPage.tsx`, `ResultPage.tsx`, `SessionPage.tsx`
- `src/services/api.ts` (+11), `src/components/AppShell.tsx` (+6), `src/components/BackButton.tsx` (+15)
- `src/styles/layout.css` (+8), `src/styles/screens.css` (+36)

### 2026-05-22

#### `708ee97` — chore: 포트폴리오용 저장소 정리 및 문서 개편
- 발표용 잔재 제거: `PPT_FLOW_SUMMARY_KO.md` (34줄), `test-api.http` (64줄), `scripts/api_probe.mjs` (104줄)
- 보안: `.env` git 추적 해제, `.gitignore` 에 `.env`/`.env.local` 추가
- `CHANGELOG.md` 신규 작성 (+37) — 본 문서의 이전 버전
- `README.md` 전면 개편 (+224) — 쇼케이스 + 비전공자 가이드 2단 구성
- 빌드 검증: `npm run build` 통과 (69 modules, 1.18s)

#### `(이번 커밋)` — docs: CHANGELOG 상세 재작성
- `CHANGELOG.md` 전면 재작성 — 버전 요약 + 28개 커밋의 작은 작업까지 빠짐없이 시간순 기록
- 각 항목에 변경된 파일·라인 수·핵심 의도 표기, 소스 코드 직접 점검 후 화면/컴포넌트/서비스/유틸 단위로 분류

---

## 통계

- 총 커밋: 29개 (2026-05-20 ~ 2026-05-22, 3일)
- 페이지: 7개
- 공통 컴포넌트: 4개
- 훅: 1개
- 서비스: 3개 (`api`, `dayNotes`, `profilePhoto`)
- 도메인 타입: 30+ 종
- 한글 라벨 매핑: 50+ 항목

[0.1.0]: https://github.com/dpgns9983-dot/smart-mirror-exercise-only/releases/tag/v0.1.0
