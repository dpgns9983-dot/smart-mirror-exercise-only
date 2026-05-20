# PC1 Smart Mirror - 발표용 구조/흐름 정리

## 1. 프로젝트 한 줄 요약
PC1은 미러 UI 전담 앱이며, 모든 운동/코칭 데이터는 PC3를 통해서만 주고받는다.

런타임 고정 구조:

```text
PC1 UI -> PC3 Vision Gateway -> PC2 NVIDIA/RAG Engine
```

## 2. 책임 분리(아키텍처)
- PC1(UI/경험): 프로필, 기준촬영, 루틴 홈, 운동 세션, 결과/히스토리 표시
- PC3(게이트웨이/계약): 프로필 원장, 루틴 생성/조회, 세션 시작/중지/결과, 코칭 로그
- PC2(NVIDIA/RAG): PC3 뒤에서 분석/추론 처리

핵심 원칙:
- PC1은 PC2/NVIDIA/DB 직접 호출 금지
- API base는 `VITE_PC3_URL` 단일 사용

## 3. 화면 구조(라우팅)
- `/profile-select`: 프로필 선택/생성/수정/삭제
- `/baseline-check`: 기본 정보 입력(몸무게/키/목표/경험/빈도/제한)
- `/baseline-setup`: 기준 촬영(face_front, body_front_full)
- `/mode`: 오늘 루틴 홈(달력 + 추천 이유 + 시작)
- `/session`: 운동 진행(실시간 분석 + 휴식 + skip/stop)
- `/result`: 세션 결과 요약/비교
- `/history`: 날짜별 기록/메모

가드 규칙:
- active profile 없음 -> `/profile-select`
- 필수 입력 미완료 -> `/baseline-check`
- baseline 미완료 -> `/baseline-setup`
- session state 없음 -> `/mode`

## 4. 사용자 플로우(End-to-End)
1. 프로필 선택/생성
2. 기본 정보 저장 + body metrics 기록
3. 기준 촬영 2슬롯 완료(face/body)
4. 루틴 홈 진입(`/mode`)
5. 오늘 루틴 확인(없으면 자동 생성 요청)
6. 운동 시작(`/session`) -> frame 업로드/코칭 표시
7. stop 또는 skip 처리
8. 결과 조회(`/result`) + 직전 세션 비교
9. 날짜별 기록 확인(`/history`) + 메모

## 5. PC3 API 계약(발표 핵심)
프로필:
- `GET /api/users/profiles`
- `POST /api/users/profiles`
- `PUT /api/users/profiles/{user_id}`
- `DELETE /api/users/profiles/{user_id}`

기준 촬영:
- `GET /api/baselines/users/{user_id}`
- `POST /api/baselines/users/{user_id}/capture`

루틴:
- `POST /api/routines/profile`
- `GET /api/routines/profile/{user_id}/calendar?from_date=&to_date=`
- `GET /api/routines/profile/{user_id}/day?target_date=`

진행/코칭:
- `GET /api/users/{user_id}/progress?days=30`
- `GET /api/coach/logs/{user_id}?limit=100`

세션:
- `POST /api/sessions/start`
- `POST /api/analyze/exercise`
- `POST /api/sessions/{session_id}/stop`
- `POST /api/sessions/{session_id}/skip`
- `GET /api/sessions/{session_id}/result`
- `WS /ws/sessions/{session_id}`

## 6. 세션 데이터 흐름(기술 슬라이드)
1. `start` 성공 시 `session_id`, `ws_url` 확보
2. 운동 중 frame을 `/api/analyze/exercise`로 전송
3. 응답으로 posture error, target status, stability 반영
4. 종료 시 `stop` 또는 `skip`
5. `result` 재조회로 저장 결과 확정
6. result/history UI에 요약/비교 데이터 렌더링

## 7. 최근 UX 핵심 개선 포인트
- mode: 오늘 루틴 미배정 시 자동 준비 흐름 강화
- history: 날짜 이동은 replace 처리로 뒤로가기 동선 단순화
- session: target status 한글화 정규화
- result: 패널 구조 단순화(핵심 8패널), 비교 문구 친화화
- 전반: 네온 시안 톤 통일

## 8. 발표 때 강조할 리스크/대응
- 리스크: PC3 연결 실패 시 화면 흐름 끊김
- 대응: API 에러 메시지 표준화 + 재시도 경로 유지
- 리스크: 계약 필드 변경
- 대응: normalize 계층으로 UI 영향 최소화
- 리스크: 실시간 세션 중 네트워크 지연
- 대응: stop/skip 실패 시 화면 전환 차단 및 재시도 제공

## 9. 데모 시나리오(3분)
1. 프로필 선택 -> 루틴 홈 진입
2. 오늘 루틴 시작 -> 세션 화면 실시간 상태 노출
3. 종료 후 결과 패널 + 지난 운동 비교 확인
4. history 날짜 이동으로 기록 검증

## 10. 결론
- PC1은 UI와 사용자 경험에 집중
- 데이터 신뢰 원천은 PC3 계약
- 현재 구조는 운영/확장(루틴/코칭/분석) 분리에 유리

## 11. 빌드 방법(발표용 운영 절차)
사전 준비:
- `.env`의 `VITE_PC3_URL`을 실제 PC3 주소로 설정
- 예: `VITE_PC3_URL=http://192.168.219.44:9000`

기본 빌드 검증:
```powershell
npm run build
```

설치파일 빌드(Tauri NSIS):
```powershell
npm run tauri -- build
```

자동 배치 사용 시:
```text
Build-PC1-Installer.cmd
```

최종 산출물:
- 루트 기준 `SmartMirror-PC1-Setup.exe`

## 12. 앱(설치본) 만드는 순서
1. `VITE_PC3_URL`을 배포 대상 환경(PC3 IP)으로 설정
2. `npm run tauri -- build` 실행
3. 생성된 NSIS 설치파일을 `SmartMirror-PC1-Setup.exe`로 확정
4. 설치파일을 전달용 위치(예: 바탕화면)로 복사
5. 대상 PC에서 설치 실행

중요:
- 설치앱은 빌드 시점의 `VITE_PC3_URL`이 내장된다.
- PC3 IP가 바뀌면 `.env` 수정 후 설치파일을 다시 빌드해야 한다.

## 13. 설치 후 다른 PC(PC3) 연결 방법
1. PC1 장비와 PC3 장비가 같은 네트워크(LAN)인지 확인
2. PC3 서비스 실행 상태 확인(포트 9000)
3. PC1 실행 후 프로필 목록 조회로 1차 확인
4. 연결 실패 시 점검:
	- PC3 IP/포트 오입력 여부
	- 방화벽 인바운드 허용(9000)
	- PC3 API 프로세스 실행 여부

연결 성공 기준:
- `GET /api/users/profiles`가 정상 응답(200)
- PC1 프로필 화면에서 목록이 표시됨
