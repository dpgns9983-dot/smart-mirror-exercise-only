# Changelog

## 2026-05-20 - 결과 화면 코칭 톤 및 안전 경보 도입

- ResultPage 코칭 섹션을 "잘된 점 / 보완할 점 / 원문" 3단계로 분리했습니다.
- 안정도 및 warnings 필드를 기반으로 안전 레벨(danger/caution/safe/neutral)을 자동 판정합니다.
- danger 또는 caution 레벨에서는 별도 SAFETY 패널이 나타나 "위험 경고" 또는 "자세 조정" 체크리스트를 제시합니다.
- EVIDENCE 섹션의 항목 라벨 호출 순서를 정리하고 메타 정보 글씨 크기를 축소했습니다.
- COACH LOGS 섹션에서 최근 코칭 로그가 운동명 + 목적 + 시각 + 본문을 한 줄에 표시하도록 확장했습니다.
- 신규 파일 `src/utils/coachingCopy.ts`에 코칭 톤 합성 헬퍼 함수들을 격리했습니다.
- 신규 CSS 클래스 `.panel--danger`(빨강 톤), `.panel--warn`(주황 톤)을 screens.css에 추가했습니다.

## 2026-05-19 - 프로필 선택/운동 시작 UX 정리 및 녹색 톤 시안 통일

- 창모드에서 프로필 카드 영역과 하단 버튼이 겹치던 문제를 완화하기 위해 프로필 선택 footer의 상향 오프셋을 제거했습니다.
- 프로필 카드 클릭 시 즉시 다음 단계로 넘어가던 동작을 제거하고, 카드 클릭은 선택만 반영되도록 분리했습니다.
- 하단 `선택하기` 버튼을 눌렀을 때만 `/mode` 또는 `/baseline-check`로 이동하도록 플로우를 정리했습니다.
- 운동 세션 자동 시작을 제거하고 idle 상태에서 `시작` 버튼으로 수동 시작하도록 복원했습니다.
- 운동/프로필/결과 화면에 남아있던 녹색 계열 배경/하이라이트 값을 시안-블루 계열로 추가 치환했습니다.

## 2026-05-19 - 프로필 선택 동작 분리 및 운동 수동 시작 복원

- 창모드에서 프로필 카드와 하단 버튼이 겹치던 현상을 줄이기 위해 프로필 선택 화면 footer의 상향 오프셋을 제거했습니다.
- 프로필 카드 클릭 시 즉시 다음 단계로 이동하던 동작을 제거하고, 카드 클릭은 선택만 반영되도록 변경했습니다.
- 하단 `선택하기` 버튼을 눌렀을 때만 `/mode` 또는 `/baseline-check`로 이동하도록 플로우를 분리했습니다.
- 운동 세션의 자동 시작을 제거하고, idle 상태에서 `시작` 버튼으로 수동 시작하도록 복원했습니다.
- 운동 화면 좌하단 `루틴으로` 버튼이 다시 보이도록(세션 시작 전 idle 상태) 기본 진입 동작을 정리했습니다.

## 2026-05-19 - PC1 전체 네온 시안 통일 및 루틴 화면 수직 중앙 정렬

- 모든 화면(프로필, baseline, 루틴, 운동, 결과 등)에 적용되는 공통 HUD 컬러를 녹색 계열에서 네온 시안(`#22E9FF` 기반)으로 통일했습니다.
- `:root`의 `--hud-*`, `--mirror-*` 변수와 잔여 녹색 rgba/HEX 값을 일괄 시안 톤으로 치환했습니다.
- 루틴 선택 화면 2열 영역을 정확히 수직 중앙으로 정렬하도록 하향 오프셋을 제거하고 상하 패딩 균형을 맞췄습니다.
- 라우팅/세션/API/상태 처리 등 기능 로직은 변경하지 않았습니다.

## 2026-05-19 - PC1 루틴 화면 잔여 녹색 제거 및 수직 중앙 정렬

- `.routine-mode-page--neon`에 HUD 공통 변수(`--hud-cyan`, `--hud-line`, `--mirror-*`)를 시안 계열로 강제 오버라이드해 잔여 녹색 톤이 섞이지 않도록 정리했습니다.
- 루틴 2열 레이아웃의 상하 여백 체감이 다르던 문제를 완화하기 위해 패딩/최대높이/하향 오프셋 값을 재조정했습니다.
- 블랙 배경 기반은 유지했고 기능 로직(루틴 선택/시작/이전/재요청)은 변경하지 않았습니다.

## 2026-05-19 - PC1 루틴 화면 쿨 시안 톤 및 상하 여백 균형 조정

- 루틴 화면 네온 톤을 더 차가운 시안/블루 계열(`#22E9FF`, `#9CF8FF`)로 보정했습니다.
- 블랙 배경을 유지한 상태에서 배경 그라디언트와 글로우 색만 쿨 톤으로 재정렬했습니다.
- 루틴 2열 영역을 아주 소폭 아래로 내려 상하 빈공간 체감이 비슷해지도록 맞췄습니다.
- 루틴 선택/시작/이전/재요청 등 기능 로직은 변경하지 않았습니다.

## 2026-05-19 - PC1 루틴 화면 네온 시안 테마 전환

- 루틴 선택 화면의 네온 포인트를 녹색 계열에서 네온 시안 계열로 전환했습니다.
- 배경은 블랙 톤을 유지하고, 보더/글로우/강조 버튼/러너 홀로그램 색을 시안 팔레트(`#00E8FF`, `#7AF6FF`)로 통일했습니다.
- 화면이 과하게 꽉 차 보이던 문제를 줄이기 위해 상하 패딩, 패널 간격, 카드 최소 높이를 재조정해 여유를 확보했습니다.
- 기능 로직(루틴 선택, 운동 시작, 이전 이동, 재요청, 상태 표기)은 변경하지 않았습니다.

## 2026-05-19 - PC1 루틴 화면 꽉참 비율 보정

- Mode 네온 화면에서 하단 공백이 크게 남던 레이아웃을 보정했습니다.
- `.routine-mode-page--neon` 스코프에서 그리드 행 구성과 content/column/panel 높이 체인을 다시 고정해, 화면을 더 꽉 채우도록 조정했습니다.
- 좌/우 패널 비율을 레퍼런스에 가깝게 재조정하고, 카드/버튼 최소 높이와 리스트 간격을 확대해 전체 체감 크기를 맞췄습니다.
- 기능 로직(루틴 선택, 시작/이전 이동, 재요청, 에러/로딩 처리)은 변경하지 않았습니다.

## 2026-05-19 - PC1 bugcheck 수정

- 운동 스킵 시 다음 운동 안내 화면이 빠지지 않도록 `/next-exercise` 전환을 `AppRouter`에서 상태 기반으로 처리하도록 보강했습니다.
- 4개 운동 루틴에서 `skip -> /next-exercise -> /session` 반복 후 마지막 운동에서만 `/result`로 이동하는 흐름을 재검증했습니다.
- 결과 화면의 사용자 문구에서 내부 시스템명 `PC2`와 raw `skip` 표시를 제거하고 `AI 코칭 메시지`, `건너뜀`으로 정리했습니다.
- `debug-runs/20260519-1404-PC1-bugcheck/`에 health, process, build, Tauri, browser flow 로그를 남겼습니다.

## 2026-05-19 - PC1 실행 설정 정리

- PC1 env 예시를 실제 현재 실행 기준으로 줄였습니다. 이제 `VITE_API_BASE_URL`, `VITE_BASELINE_REQUIREMENT_MODE`, `VITE_DEVICE_ID`만 기본 예시로 남겼습니다.
- debug capture 관련 ignore 규칙과 불필요한 테스트/오프너 설정을 정리하고, Tauri/Vite 개발 포트를 `1453`으로 고정해 실행 기준을 맞췄습니다.
- PC1 실행 문서도 현재 흐름에 맞게 간단히 정리했습니다.

## 2026-05-19 - PC1 레이아웃 스테이지 정리

- PC1 전용 작업 범위를 유지한 채 공통 `MirrorAppShell`과 카메라 HUD 배치를 가운데 정렬된 스테이지 형태로 조정했습니다.
- 기능 흐름은 그대로 두고, 상단/본문 콘텐츠 폭과 정렬 기준만 정리해 profile, routine, session, result 화면의 시선 흐름을 조금 더 안정적으로 맞췄습니다.
- PC1 저장소만 수정했고 PC2/PC3 저장소는 건드리지 않았습니다.

## 2026-05-19 - PC1 only UI 정리 및 로컬 연동 확인

- PC1 작업 기준을 `smart-mirror-exercise-only/pc1`로 고정하고, PC2(`tmdwn0196-osj/smart-mirror-aiot-coaching`), PC3(`rad1092/smart-mirror-aiot-coaching`), `smart-mirror-exercise-only-ui-review`는 읽기 전용 reference로 분리했습니다.
- git log 흐름을 기준으로 exercise-only 저장소 분리, PC1 -> PC3 경유 구조, baseline front checkpoint 계약 반영, PC3 운동 분석/routine/session/result 계약 정렬, demo/profile HUD와 Tauri 실행 흐름을 한 덩어리로 정리했습니다.
- 루트 문서 정리 범위를 반영했습니다: `README.md`, `FLOW_CHANGES.md`, `CHANGELOG.md`를 최신 PC1 중심 설명으로 맞추고, 오래된 PC2/PC3 status 문서와 중복 handoff/integration 문서는 `docs/pc3_contract.md` 중심으로 정리했습니다.
- PC1 런타임 최소화 범위를 기록했습니다: client-side MediaPipe wasm/model asset, Tauri Rust analyze/debug command, debug capture scaffold, 사용하지 않는 opener/template 의존성을 제거해 PC3 서버 계약을 기준으로만 동작하게 했습니다.
- 마지막 UI 교체 작업으로 profile, baseline, mode, session, next exercise, result 화면을 PC1 only 안에서 정리하고 `MirrorAppShell`, window controls, workout run/visualization helper, PC3 visualization mock helper를 새 UI 흐름에 연결했습니다.
- profile 입력, baseline 촬영/스킵, routine 추천, 운동 세션, 다음 운동, 결과 화면 state/type을 정리해 PC3 routine schedule/day detail과 PC2 routine 응답 변환 결과를 PC1 화면에 표시할 수 있게 했습니다.
- Tauri 개발 실행 기준을 `localhost:1453`으로 맞추고, Windows 제외 포트 때문에 기존 `1420` 대신 `1453`을 사용하도록 확인했습니다.
- PC3/PC2 로컬 연결은 실행 상태와 API 응답만 확인했습니다. PC3/PC2 저장소 파일은 수정하지 않으며, PC1은 PC3가 제공하는 계약과 PC2 routine 응답 변환 결과에 맞춰 동작합니다.
- baseline skip 로컬 테스트 보완은 PC1 테스트 플래그 기반으로만 동작하게 두었고, 실제 PC3/PC2 계약 변경은 하지 않았습니다.
- profile 선택 화면의 이름 입력/생성/선택 버튼 묶음을 소폭 위로 올려 첫 화면 조작 영역을 정리했습니다.
- profile tile 클릭/Enter/Space 입력 시 별도 `선택하기` 버튼 없이 즉시 해당 프로필 흐름으로 이동하도록 조정했습니다.

### 2026-05-19 직접 확인한 파일별 변경 내역

#### 루트 문서

- `CHANGELOG.md`: 이전의 긴 git log 중심 기록을 최신 PC1 only 정리본으로 압축했고, 이번 직접 확인 내역을 추가했습니다.
- `FLOW_CHANGES.md`: 과거 커밋별 상세 흐름 문서를 현재 책임 범위와 실제 런타임 흐름 중심으로 재작성했습니다. PC1 -> PC3 -> PC2 경계를 명확히 하고 baseline, routine, exercise, result 흐름을 현재 코드 기준으로 정리했습니다.
- `README.md`: PC1 전용 Tauri + React 저장소 설명으로 간소화했습니다. 실행 방법, 환경값, PC3 계약 요약을 현재 기준으로 맞췄습니다.
- `PC2_STATUS.md`: 삭제됐습니다. PC2 상태 전달 문서는 현재 PC1 저장소 변경 이력에서 제거된 상태입니다.
- `PC3_STATUS.md`: 삭제됐습니다. PC3 상태 전달 문서는 `docs/pc3_contract.md` 중심으로 대체된 상태입니다.
- `docs/api_contract_handoff_2026-05-11.md`: 삭제됐습니다. 오래된 handoff 계약 문서입니다.
- `docs/cleanup_history.md`: 삭제됐습니다. 과거 정리 이력 문서입니다.
- `docs/exercise_frontend_integration_guide_2026-05-11.md`: 삭제됐습니다. 오래된 front integration guide입니다.
- `docs/pc1_exercise_integration_slots_2026-05-11.md`: 삭제됐습니다. 이전 baseline slot/연동 문서입니다.
- `docs/pc1_integration_guide.md`: 삭제됐습니다. 현재 흐름에서는 `FLOW_CHANGES.md`와 `docs/pc3_contract.md`가 기준입니다.
- `docs/pc3_contract.md`: 새로 추가됐습니다. PC3 기준 저장소, baseline 2-slot, routine/profile, session start, frame upload, realtime fields, stop session 응답 필드를 PC1 관점으로 정리했습니다.

#### PC1 실행/설정

- `pc1/.env.example`: `VITE_API_MODE`, `VITE_MOCK_*`, `VITE_TEST_MODE` 예시를 제거했습니다. 현재 기본 env는 `VITE_API_BASE_URL`, `VITE_BASELINE_REQUIREMENT_MODE`, `VITE_DEVICE_ID` 중심입니다.
- `pc1/.gitignore`: 기존 `debug-captures` 예외 규칙을 제거했습니다. `pc1/debug-captures/.gitkeep`도 삭제되어 debug capture 폴더 유지 정책이 빠진 상태입니다.
- `pc1/README.md`: PC1 실행 루트 설명, 명령어, PC3 env, 현재 runtime flow를 현재 코드 기준으로 다시 적었습니다.
- `pc1/package.json`: `test` script와 `vitest`, `@tauri-apps/plugin-opener` 의존성을 제거했습니다. `@tauri-apps/api`는 `^2.11.0`로 고정되었습니다.
- `pc1/package-lock.json`: `vitest`, `@vitest/*`, `chai`, `vite-node`, `tinypool`, `why-is-node-running`, `@tauri-apps/plugin-opener` 관련 lock 항목이 제거됐습니다.
- `pc1/vite.config.ts`: Tauri/Vite dev server port를 `1420`에서 `1453`으로 변경했습니다.

#### Tauri shell

- `pc1/src-tauri/Cargo.toml`: `tauri-plugin-opener`, `serde`, `serde_json`, `reqwest`, `tokio`, `thiserror` 직접 의존성을 제거했습니다.
- `pc1/src-tauri/Cargo.lock`: 위 의존성 제거에 따라 opener, rustls/reqwest/tokio 일부 transitive 항목이 정리됐습니다.
- `pc1/src-tauri/capabilities/default.json`: opener 권한을 제거하고 window close/minimize/fullscreen/size/position/dragging 관련 core 권한을 추가했습니다.
- `pc1/src-tauri/src/lib.rs`: template `greet`, `ping`, debug capture command handler와 opener plugin 초기화를 제거했습니다. 현재 Tauri builder는 앱 실행만 담당합니다.
- `pc1/src-tauri/src/commands/analyze.rs`: 삭제됐습니다. JS fetch/WebSocket이 PC3 통신을 직접 담당하므로 Rust ping command가 제거됐습니다.
- `pc1/src-tauri/src/commands/debug_capture.rs`: 삭제됐습니다. JPG/JSON debug capture를 Rust command로 저장하던 기능이 제거됐습니다.
- `pc1/src-tauri/src/commands/mod.rs`: 삭제됐습니다. commands module 자체가 더 이상 사용되지 않습니다.
- `pc1/src-tauri/tauri.conf.json`: dev URL을 `http://localhost:1453`으로 변경했고, main window를 fullscreen, frameless, non-resizable로 바꿨습니다.

#### 제거된 PC1 client asset

- `pc1/public/mediapipe/wasm/vision_wasm_internal.js`: 삭제됐습니다.
- `pc1/public/mediapipe/wasm/vision_wasm_internal.wasm`: 삭제됐습니다.
- `pc1/public/mediapipe/wasm/vision_wasm_module_internal.js`: 삭제됐습니다.
- `pc1/public/mediapipe/wasm/vision_wasm_module_internal.wasm`: 삭제됐습니다.
- `pc1/public/mediapipe/wasm/vision_wasm_nosimd_internal.js`: 삭제됐습니다.
- `pc1/public/mediapipe/wasm/vision_wasm_nosimd_internal.wasm`: 삭제됐습니다.
- `pc1/public/models/pose_landmarker_lite.task`: 삭제됐습니다.
- 위 asset 삭제로 PC1은 브라우저 내 MediaPipe pose 추론보다 PC3 분석 결과를 기준으로 동작하는 방향으로 정리됐습니다.

#### PC1 공통 UI

- `pc1/src/App.tsx`: 새 `WindowControls`를 HashRouter 안에 전역으로 마운트했습니다.
- `pc1/src/App.css`: 대규모 UI CSS가 교체/추가됐습니다. `mirror-app-shell`, profile carousel/footer, routine picker, baseline full-screen capture, workout session overlay, next exercise, result HUD, wizard/check/choice controls, windowless Tauri 화면 스타일을 포함합니다. profile footer는 `transform: translateY(-42px)`로 입력/선택 컨트롤 위치를 올린 상태입니다.
- `pc1/src/components/MirrorAppShell.tsx`: 새 공통 shell입니다. header/title/subtitle/content/footer 구조를 제공하고, 비카메라 화면 진입 시 `stopCamera`를 호출합니다.
- `pc1/src/components/WindowControls.tsx`: 새 frameless Tauri window control입니다. minimize, close, fullscreen/half-size 전환, half-size drag를 처리합니다. Tauri가 아닌 브라우저에서는 안전하게 no-op 또는 `window.close()` fallback을 사용합니다.
- `pc1/src/components/WindowControls.css`: window control hover zone, 버튼, half-size drag hint 스타일을 추가했습니다.
- `pc1/src/components/DemoSkipPanel.tsx`: demo baseline skip 시 `saveTemporaryBaselineForLocalTest`를 호출한 뒤 `/mode`로 이동하도록 바뀌었습니다.
- `pc1/src/components/CameraHudShell.tsx`: 파일은 남아 있지만 현재 변경된 주요 화면에서는 `MirrorAppShell` 또는 full-screen 전용 layout으로 이동하면서 직접 import가 빠졌습니다.

#### Profile/Baseline 화면

- `pc1/src/pages/ProfileSelectPage.tsx`: 기존 좌우 HUD 선택 화면을 `SMART MIRROR` 첫 화면 carousel로 교체했습니다. profile tile, 좌우 arrow scroll, footer create form, select button, delete modal, double-click start, keyboard select가 포함됩니다.
- `pc1/src/pages/BaselineCheckPage.tsx`: profile input을 3-step wizard로 바꿨습니다. 기본 정보, 운동 경력, 제한 사항을 나눠 입력하고, `LIMITATION_OPTIONS`를 저장하도록 변경했습니다.
- `pc1/src/pages/BaselineSetupPage.tsx`: 기존 `CameraHudShell` 기반 panel UI를 full-screen camera capture 화면으로 교체했습니다. face/body guide overlay, bottom capture bar, preview, manual capture, skip confirmation dialog를 추가했습니다.
- `pc1/src/constants/baselineSetup.ts`: baseline 안내 문구를 자동 촬영 중심 표현에서 현재 UI에 맞춘 촬영/프레임 안내 문구로 조정했습니다.
- `pc1/src/services/baseline.ts`: `VITE_ALLOW_TEMP_BASELINE_UPSERT=true`일 때만 동작하는 `saveTemporaryBaselineForLocalTest`를 추가했습니다. 로컬 테스트 skip 시 PC3 baseline 저장 API에 `face_front`, `body_front_full` captured payload를 보냅니다.

#### Routine/Session/Result 흐름

- `pc1/src/pages/ModePage.tsx`: 단일 routine card/운동 타입 선택 UI를 AI 추천 루틴과 기본 루틴 선택 UI로 바꿨습니다. PC3 `weekly_routine` 또는 mock visualization data를 일자별 routine list로 표시하고, 시작 시 `WorkoutRunState`를 생성합니다.
- `pc1/src/pages/CameraPage.tsx`: 운동 세션 화면을 full-screen overlay로 교체했습니다. 카메라 ready와 PC3 health가 준비되면 자동 시작하고, PC3 count를 목표 반복 수와 비교해 자동 종료합니다. skip, pending result retry, 다음 운동 이동, aggregate result 생성을 처리합니다.
- `pc1/src/pages/NextExercisePage.tsx`: 새 화면입니다. 루틴 내 다음 운동을 2.5초 동안 안내한 뒤 `/session`으로 자동 이동합니다.
- `pc1/src/pages/ResultPage.tsx`: 기존 결과 panel을 result HUD로 교체했습니다. 단일 운동 결과와 aggregate 결과를 모두 표시하고, 안정도 ring, PC2 coaching message, 자세 안내, 운동별 bar, 다시 시작/홈 이동을 제공합니다. 결과 snapshot은 localStorage history에도 기록합니다.
- `pc1/src/router/AppRouter.tsx`: `/next-exercise` route를 추가했습니다. routine 시작 시 `workoutRun`을 저장하고, result 재시작/홈 이동 흐름을 새 aggregate flow에 맞게 조정했습니다. baseline skip handler도 추가했습니다.
- `pc1/src/state/useAppFlow.ts`: 전역 flow state에 `workoutRun`과 setter를 추가했고, profile select 진입 시 workout/run/result 상태가 남아 있으면 초기화하도록 확장했습니다.
- `pc1/src/types/routine.ts`: PC3 `weekly_routine` 표시를 위해 `WeeklyRoutineExercise`, `WeeklyRoutineDay`, `RoutineBundle.weeklyRoutine` 타입을 추가했습니다.
- `pc1/src/types/result.ts`: multi-exercise run과 aggregate result 표시를 위해 `WorkoutRunExercise`, `WorkoutRunResult`, `WorkoutRunState`, `WorkoutAggregateExercise`, `WorkoutAggregateResult` 타입을 추가했습니다.
- `pc1/src/services/routines.ts`: PC3 `weekly_routine` payload 타입과 `weeklyRoutinePayloadToDays` adapter를 추가했습니다. `RecommendationResponsePayload.weekly_routine`을 typed payload로 받고 `RoutineBundle.weeklyRoutine`으로 보존합니다.
- `pc1/src/services/visualization.ts`: 새 helper입니다. PC3 visualization mock data로 weekly routine day를 보완하고, result 화면용 exercise history snapshot을 만들고 localStorage에 최근 기록을 저장합니다.
- `pc1/src/services/workoutRun.ts`: 새 helper입니다. routine day를 실행 가능한 workout run으로 변환하고, 현재 운동 조회, skip result 생성, 다음 운동 이동, 여러 운동 결과 aggregate 생성을 담당합니다.
- `pc1/src/mocks/pc3VisualizationMock.json`: 새 mock data입니다. goal/experience/limitation별 routine response와 운동별 session stop/coaching 예시를 담아 visualization helper fallback으로 사용됩니다.

#### 현재 작업 산출물

- `pc1/.codex-run/`: 브라우저/데스크톱 확인용 screenshot 산출물이 untracked 상태로 있습니다. 앱 소스는 아니며 커밋 전 포함 여부를 따로 판단해야 합니다.
- `pc1/debug-runs/20260519-1114-PC1-bugcheck/`: PC1 실행 점검 당시 env, git status, process, health, screenshot 로그가 untracked 상태로 있습니다. 앱 소스는 아니며 커밋 전 포함 여부를 따로 판단해야 합니다.

이 문서는 PC1 저장소 변경 이력을 최신 작업 기준으로 정리합니다.

## 2026-05-14 - PC1 2차 최소화 정리

- legacy 화면과 삭제된 컴포넌트에서 쓰던 CSS 잔재를 제거하고 현재 TSX에서 참조되는 HUD 스타일만 남겼습니다.
- baseline completion에서 local fallback 상태를 제거하고 PC3 저장 검증 성공 시에만 `verified`로 완료되도록 정리했습니다.
- legacy localStorage의 `baselineCompletion="fallback"` 값은 `missing`으로 정규화해 PC3 baseline 재촬영을 요구합니다.
- analyze/result의 mock fallback 필드와 사용되지 않는 baseline helper/type을 제거했습니다.

## 2026-05-14 - PC1 최소 실행 구조 정리

- PC3 실서버를 전제로 운영 흐름만 남기고 mock/test/debug 경로를 제거했습니다.
- `_DebugPanel`, debug capture command/service, 임시 baseline/결과/test profile 진입점을 삭제했습니다.
- `VITE_API_MODE`, `VITE_TEST_MODE`, `VITE_MOCK_*` 환경값을 제거하고 `VITE_API_BASE_URL` 기준 호출만 유지했습니다.
- 로컬 mock 결과와 local routine fallback을 제거했습니다. PC3가 반환하는 `source="basic"` fallback은 계속 정상 루틴으로 표시합니다.
- 사용되지 않는 UI 컴포넌트, contract adapter, PC1 client-side MediaPipe asset, pose model 파일을 삭제했습니다.
- Tauri shell에서 template command와 opener plugin/dependency를 제거하고 capability를 `core:default`만 남겼습니다.
- `npm install`, `npm run build`, `cargo check --manifest-path pc1/src-tauri/Cargo.toml`로 검증했습니다.

## 2026-05-14 - PC3 `d1da319` 계약 기준 정리

- PC3 저장소 `rad1092/smart-mirror-aiot-coaching`을 최신 `main` `d1da319`까지 fast-forward했습니다.
- baseline 계약을 `face_front`, `body_front_full` 두 개로 고정했습니다.
- PC1 타입/state에서 deprecated `body_right_full`, `body_left_full` 슬롯을 제거했습니다.
- PC1 운동 화면에서 `target_status`, `measurement_quality`, `measurement_confidence`를 표시하도록 보강했습니다.
- 오래된 PC2/PC3 handoff 문서와 중복 docs를 제거하고 `docs/pc3_contract.md` 하나로 계약 문서를 통합했습니다.

## 2026-05-13 - PC1/PC3 작업 공간 분리

- PC1 Tauri + React 앱은 `smart-mirror-exercise-only`에서 관리합니다.
- PC3 FastAPI/Python 서버는 `C:\Projects\Project\smart-mirror-aiot-coaching`에서 관리합니다.
- PC1은 PC2를 직접 호출하지 않고 PC3만 backend boundary로 사용합니다.

## 2026-05-11 - Exercise-only 저장소 초기화

- PC1 운동 전용 앱 흐름을 분리했습니다.
- 기본 화면 흐름: profile -> baseline -> routine -> camera session -> result.
