# PC1 결과 데이터 이해 가이드 (비전공자용)

이 문서는 "운동을 실제로 하지 않아도" PC3 API를 직접 호출해서,
결과 화면에 어떤 데이터가 들어오는지 이해하기 쉽게 정리한 문서입니다.

---

## 1) 한 줄 요약

- 데이터가 적은 것이 아닙니다.
- 이미 자세/개선 비교에 쓸 핵심 필드가 들어오고 있습니다.
- 지금 필요한 것은 "어떤 지표를 화면에 보여줄지" 선택하는 일입니다.

---

## 2) 제일 쉬운 테스트 방법

### 방법 A: test-api.http 사용 (추천)

파일 위치: `pc1/test-api.http`

실행 순서:
1. createProfile
2. startSession
3. stopSession (또는 skipSession)
4. getSessionResult
5. getProgress
6. getCoachLogs

이렇게 하면 실제 운동 없이도 세션 결과를 만들고 조회할 수 있습니다.

### 방법 B: 자동 점검 스크립트 사용

파일 위치: `pc1/scripts/api_probe.mjs`

명령:
- node scripts/api_probe.mjs

이 스크립트는 profiles/progress/start/stop/result/coach_logs를 순서대로 호출하고,
응답 상태와 사용 가능 필드를 한 번에 요약해줍니다.

---

## 3) 실제로 어디에서 무슨 데이터가 오는가

### 3-1. 세션 결과 핵심 API

- POST /api/sessions/start
  - 세션 시작, session_id 생성
- POST /api/sessions/{session_id}/stop
  - 세션 종료 결과 생성
- GET /api/sessions/{session_id}/result
  - 저장된 최종 결과 재조회

### 3-2. 비교용 보조 API

- GET /api/users/{user_id}/progress?days=30
  - 최근 기록 통계, 평균 안정도, 최근 운동 결과
- GET /api/coach/logs/{user_id}?limit=5
  - 최근 코칭 로그

---

## 4) 결과 화면에 바로 쓸 수 있는 필드

아래 항목은 실호출 점검에서 확인된 필드입니다.

### 자세 관련
- features.exercise.posture_errors
  - 어떤 자세 오류가 있었는지
- features.exercise.stability_score
  - 자세 안정도 점수
- features.exercise.measurement_quality
  - 측정 품질
- features.exercise.measurement_confidence
  - 측정 신뢰도

### 운동 수행량 관련
- features.exercise.count
  - 총 반복 횟수
- features.exercise.count_left
  - 왼쪽 횟수
- features.exercise.count_right
  - 오른쪽 횟수

### 전후 비교 관련
- baseline_diff
  - 기준 촬영 대비 변화값
- progress.workout_summary.avg_stability_score
  - 최근 기간 평균 안정도
- progress.recent_workouts
  - 최근 세션들의 점수/횟수/품질

---

## 5) "전보다 좋아졌는지" 보여주는 추천 지표

### 지표 1: 안정도 변화
- 계산: 이번 stability_score - 최근 평균 stability_score
- 표시 예시
  - + 이면 "안정도 상승"
  - - 이면 "안정도 하락"

### 지표 2: 자세 오류 변화
- 계산: 이번 posture_errors 개수 - 직전 세션 posture_errors 개수
- 표시 예시
  - 감소하면 "자세 오류 개선"

### 지표 3: 좌우 밸런스 변화
- 계산: abs(count_left - count_right)
- 표시 예시
  - 값이 작아질수록 "좌우 균형 개선"

### 지표 4: 측정 신뢰도 추세
- 계산: 이번 measurement_confidence vs 직전/최근 평균
- 표시 예시
  - 상승하면 "동작 인식 품질 개선"

---

## 6) 지금 화면에 남기는 것을 추천하는 최소 항목

복잡하지 않게 하려면 아래만 먼저 보여주는 것을 추천합니다.

1. 총 반복 횟수
2. 안정도(%)
3. 좌/우 카운트
4. 전 세션 대비 안정도 변화(+/-)
5. 자세 오류 개수 변화(+/-)

---

## 7) 확인된 사실 (테스트 기준)

실제 PC3 연결 테스트에서 아래 6개 API는 모두 정상 응답(200) 확인했습니다.

1. /api/users/profiles
2. /api/users/{id}/progress
3. /api/sessions/start
4. /api/sessions/{session_id}/stop
5. /api/sessions/{session_id}/result
6. /api/coach/logs/{id}

즉, "호출 가능한 데이터가 없는 상태"는 아닙니다.
화면 설계만 정리하면 충분히 좋은 결과 화면을 만들 수 있습니다.
