# Flow Changes

## 비전공자용 결과 데이터 가이드 문서 추가 (Docs)

이번 변경은 구현 코드가 아니라 설명 문서 보강 작업입니다.

- `RESULT_DATA_GUIDE_KO.md`를 추가해 아래 내용을 한 번에 이해할 수 있도록 정리했습니다.
  - 실제 호출 순서(start/stop/result/progress/logs)
  - 호출 방법(`test-api.http`, `scripts/api_probe.mjs`)
  - 결과 화면에 활용 가능한 필드 목록
  - 전후 비교 추천 지표(안정도/자세오류/좌우밸런스)
- 목적은 "어떤 데이터를 받을 수 있는지"를 개발자/비개발자 모두 빠르게 합의할 수 있게 하는 것입니다.

## 결과화면 간소화 + 실호출 필드 검증 (Result/API)

이번 변경은 결과 화면에서 불필요한 정보 노출을 제거하고, PC3 실서버 호출로 실제 수집 필드를 검증한 작업입니다.

- Result 화면에서 아래 섹션/문구를 제거했습니다.
  - 세션 결과 재조회 상태 문구
  - 측정 품질 문구
  - PC3 원문 문구
  - 최근 코칭 로그 패널
  - DETAILS( baseline/environment/evidence ) 패널
- 결과 화면은 핵심 수치 중심으로 정리했습니다.
  - 운동 횟수
  - 좌/우 카운트
  - 측정 신뢰도
- `scripts/api_probe.mjs`로 PC3 실호출을 수행해 다음 API를 확인했습니다.
  - `/api/users/profiles`
  - `/api/users/{id}/progress`
  - `/api/sessions/start`
  - `/api/sessions/{session_id}/stop`
  - `/api/sessions/{session_id}/result`
  - `/api/coach/logs/{id}`
- 위 6개 호출은 테스트 시점에 모두 200 응답을 반환했고, 자세/전후 비교에 필요한 핵심 필드 존재를 확인했습니다.

## 결과화면 상세 데이터 노출 + 수동 API 테스트 경로 추가 (Result/Data)

이번 변경은 PC3 응답을 결과화면에서 더 많이 보여주고, 실제 운동 없이도 엔드포인트 호출로 검증할 수 있게 한 작업입니다.

- `pc1/test-api.http`를 추가해 시작/종료/스킵/결과재조회/진행요약/코칭로그를 순서대로 직접 호출할 수 있게 했습니다.
- Result 화면의 SESSION 패널에 좌우 카운트와 측정 신뢰도 필드를 추가했습니다.
- Result 화면에 DETAILS 패널을 추가해 아래 원본 값을 확인할 수 있게 했습니다.
  - `baseline_diff`의 primitive 키/값
  - `environment`의 primitive 키/값
  - `coaching.pc2_payload.evidence` 주요 라벨
- API 계약은 변경하지 않았고, PC1 표시 레이어와 수동 검증 경로만 확장했습니다.

## 결과 화면 코칭 요약 톤 및 안전 경보 도입 (UX/Display)

이번 변경은 PC3에서 받아온 코칭 데이터(warnings, display_lines, stability_score, measurement_quality)를 PC1이 재해석해 더 자연스러운 톤으로 표시하는 합성 레이어입니다.

- PC3 원본 필드는 그대로 유지하고, 화면 표시 계층에서만 재구성했습니다(데이터 계약 무변경).
- 안정도 + warnings를 조합해 safety level(danger/caution/safe/neutral)을 판정하고, 그에 맞는 긍정 메시지를 합성합니다.
- danger 또는 caution 레벨에서는 별도 "SAFETY" 패널이 나타나 체크리스트(통증 확인, 자세 점검 등)를 제시합니다.
- COACH LOGS 섹션의 로그 제목을 단순 summary에서 목적+시각+본문으로 확장해 로그 간 구분을 명확히 했습니다.
- API 응답 구조/코칭 로직은 건드리지 않았고, PC1의 표시 레이어 재해석만 추가했습니다.

*** End Patch

## 프로필 선택 이동 트리거 분리 + 선택 화면 시안 통일 (UX/Style)

이번 변경은 사용자 조작 타이밍과 선택 상태 시각 톤을 함께 정리한 작업입니다.

- 프로필 카드 클릭은 선택 상태만 바꾸고, 실제 페이지 이동은 `선택하기` 버튼에서만 수행하도록 분리했습니다.
- 운동 세션은 자동 시작 대신 idle 상태에서 `시작` 버튼으로 진입하도록 변경했습니다.
- 운동 시작 전 `루틴으로` 버튼이 다시 보이도록 초기 상태 UX를 복원했습니다.
- 프로필 선택/결과/운동 버튼의 녹색 잔여 배경 톤을 시안-블루 계열로 추가 치환했습니다.
- API/세션/라우팅 구조는 유지했고, 사용자 인터랙션 타이밍과 화면 톤만 조정했습니다.

## 프로필 선택 분리 + 운동 수동 시작 복원 (UX/Flow)

이번 변경은 사용자 상호작용 타이밍을 조정하는 흐름 개선입니다.

- 프로필 카드 클릭은 `선택`만 수행하고, 실제 페이지 이동은 `선택하기` 버튼에서만 일어나도록 분리했습니다.
- ready 프로필 자동 진입 체감(카드 클릭 즉시 시작)을 제거해 오동작처럼 느껴지던 흐름을 정리했습니다.
- 운동 세션은 자동 시작 대신 idle 상태에서 `시작` 버튼을 눌러 진입하도록 변경했습니다.
- 운동 시작 전에는 좌하단 `루틴으로` 버튼이 항상 보이도록 기존 UX를 복원했습니다.
- 창모드 겹침 완화를 위해 프로필 선택 화면 footer의 위치 오프셋을 제거했습니다.

## 전체 화면 네온 시안 통일 및 루틴 수직 중앙 정렬 (UI only)

이번 변경은 색상 변수와 정렬값만 다뤘습니다.

- 전역 HUD 변수와 App.css에 남아있던 녹색 rgba/HEX 값을 네온 시안(`#22E9FF` 기반)으로 일괄 교체했습니다.
- 루틴 선택 화면의 2열 컬럼에서 하향 오프셋을 제거하고 `align-self: center` + 상하 패딩 균형으로 정확히 수직 중앙 정렬했습니다.
- 라우팅, API, 세션, 상태 처리 흐름은 기존과 동일합니다.

## 루틴 화면 잔여 녹색 제거 및 수직 중앙 정렬 (UI only)

이번 변경은 Mode 화면의 스타일 변수/배치값만 조정했습니다.

- 네온 페이지 스코프에서 HUD 공통 색 변수를 시안으로 강제해 화면 일부에 녹색 톤이 남는 현상을 제거했습니다.
- 상하 여백 균형을 위해 패딩, 컬럼 max-height, 하향 오프셋 값을 재조정해 중앙 정렬 체감을 맞췄습니다.
- 라우팅/API/상태 처리 동작은 기존과 동일합니다.

## 루틴 화면 쿨 시안 리터치 및 상하 균형 조정 (UI only)

이번 변경은 Mode 화면 시각 레이어만 미세 조정했습니다.

- 네온 포인트를 차가운 시안/블루 계열로 재튜닝하고 블랙 배경은 유지했습니다.
- `.routine-mode-page--neon .mirror-two-column`을 소폭 하향해 위아래 여백 체감을 균형화했습니다.
- 라우팅/세션/API/상태 처리 흐름은 기존과 동일합니다.

## 루틴 화면 네온 시안 전환 (UI only)

이번 변경은 Mode 화면의 색상/밀도 조정만 포함합니다.

- 네온 포인트를 녹색에서 시안으로 변경하고, 블랙 배경 기반 HUD 톤을 유지했습니다.
- 레이아웃 밀도를 낮추기 위해 상하 여백, 패널 간 간격, 카드 최소 높이를 재조정했습니다.
- 라우팅/세션/API/상태 처리 흐름은 기존과 동일합니다.

## 루틴 화면 꽉참 보정 (UI only)

이번 변경은 Mode 화면의 시각 배치만 다룹니다.

- `.routine-mode-page--neon` 범위에서 상하 여백, 그리드 높이, 패널 stretch 규칙을 조정해 하단 빈 공간을 축소했습니다.
- 좌/우 컬럼 비율을 재조정하고 카드/버튼/Day 리스트의 최소 높이를 키워 레퍼런스와 유사한 화면 점유율로 맞췄습니다.
- 라우팅, API 호출, 루틴 선택/시작/재요청 동작, 상태 처리 규칙은 변경하지 않았습니다.

## UI 레이아웃 보정

이번 작업은 화면 전환이나 데이터 흐름을 바꾸지 않았습니다.

- 공통 shell과 카메라 HUD의 본문 폭을 중앙 스테이지 기준으로 맞췄습니다.
- profile, routine, session, result 화면은 기존 흐름을 유지하고 레이아웃 정렬만 조정했습니다.

## 현재 책임 범위

```text
User
  -> PC1 Tauri + React
      -> profile 입력/선택
      -> baseline 2-slot 촬영
      -> PC3 routine 표시
      -> exercise session 표시
      -> result 표시
  -> PC3 Vision Gateway
      -> baseline 검증
      -> routine 요청 정규화 및 PC2 중계
      -> pose analysis
      -> WebSocket realtime
      -> stop 결과 및 coaching 중계
  -> PC2 Coach API
      -> PC3 뒤에서만 호출됨
```

PC1은 PC2를 직접 호출하지 않습니다. PC1의 backend boundary는 PC3 하나입니다.

## 화면 흐름

```text
ProfileSelect
  -> BaselineCheck
  -> BaselineSetup
  -> Mode
  -> Camera
  -> Result
```

## Baseline Flow

```text
BaselineSetup
  -> useLiveCamera.start()
  -> face_front 촬영
      -> PC3 POST /api/baselines/users/{user_id}/capture
  -> body_front_full 촬영
      -> PC3 POST /api/baselines/users/{user_id}/capture
  -> PC3 GET /api/baselines/users/{user_id}
      -> face_front + body_front_full 저장 확인
  -> Mode
```

폐기된 slot:

- `body_right_full`
- `body_left_full`

Legacy `baselineCompletion="fallback"` 프로필은 더 이상 완료 상태로 인정하지 않습니다. PC1은 해당 값을 `missing`으로 정규화하고 PC3 baseline 재촬영 흐름으로 보냅니다.

## Routine Flow

```text
Mode
  -> fetchRecommendedRoutine(profile)
      -> PC3 POST /api/routines/profile
  -> PC3 response -> RoutineBundle
  -> selected routine 저장
  -> Camera
```

PC3가 `source="basic"` fallback을 반환해도 PC1은 정상 루틴으로 표시합니다. PC3 요청 자체가 실패하면 로컬 루틴으로 대체하지 않고 오류와 재시도 버튼을 표시합니다.

## Exercise Flow

```text
Camera
  -> PC3 GET /health preflight
  -> PC3 POST /api/sessions/start
      -> session_id 저장
      -> ws_url 그대로 WebSocket 연결
  -> 운동 타입별 cadence로 POST /api/analyze/exercise 반복
      -> squat / pushup / lunge: 300ms
      -> knee_raise / jumping_jack: 200ms
      -> 이전 요청 in-flight이면 다음 frame skip
  -> WebSocket exercise_update 수신
      -> session_id가 active session과 같을 때만 반영
      -> count / state / feedback / posture_errors 표시
      -> target_status / measurement_quality 표시
  -> PC3 POST /api/sessions/{session_id}/stop
  -> Result
```

PC1은 count를 직접 증가/보정하지 않습니다. PC3의 `count`가 source of truth입니다.

## Result Flow

```text
Result
  -> final.features.exercise 표시
  -> final.coaching 표시
  -> selected routine context 보조 표시
```

우선 사용 필드:

- `features.exercise.type`
- `features.exercise.count`
- `features.exercise.stability_score`
- `features.exercise.posture_errors`
- `features.exercise.measurement_quality`
- `coaching.summary`
- `coaching.mirror_message`
- `coaching.pc2_payload.display_lines`
