# PC1 발표용 흐름 요약

## 한 문장

PC1은 사용자가 거울 앞에서 프로필을 고르고 루틴을 수행하면, PC3 분석과 PC2 코칭 결과를 받아 화면에 보여주는 스마트 미러 UI입니다.

## 역할

- PC1: 화면, 카메라, 사용자 플로우
- PC3: 프로필/루틴/세션 관리, 자세 분석 API 중계
- PC2: RAG 기반 코칭 문장과 근거 생성

## 데모 순서

1. 프로필 선택
2. 오늘 루틴 확인
3. 운동 시작 및 카메라 분석
4. 운동 완료
5. 결과 리포트 확인

## 핵심 API

- `GET /api/users/profiles`: 프로필 목록
- `POST /api/routines/profile`: 사용자 기준 루틴 생성
- `GET /api/routines/profile/{user_id}/day`: 오늘 루틴 조회
- `POST /api/sessions/start`: 운동 세션 시작
- `POST /api/analyze/exercise`: 프레임 분석
- `POST /api/sessions/{session_id}/stop`: 운동 종료 및 결과 생성

## 발표 포인트

- PC1은 화면과 카메라 경험에 집중하고, 분석 판단은 PC3/PC2가 맡습니다.
- 사용자는 프로필 선택부터 결과 확인까지 거울 화면 안에서 이어서 진행합니다.
- 결과 화면은 루틴 전체 기준으로 완료 동작, 반복 수, 안정도, 주의 항목을 요약합니다.
