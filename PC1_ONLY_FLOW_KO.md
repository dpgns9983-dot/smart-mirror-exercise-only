# PC1 전용 구조/흐름 요약

## 1) 핵심 범위
이 문서는 오직 PC1 기준으로만 정리한다.

- PC1은 화면(UI)과 사용자 흐름을 담당한다.
- PC1은 `VITE_PC3_URL`로 지정된 PC3 API만 호출한다.
- PC1은 외부 분석/DB에 직접 붙지 않는다.

## 2) PC1 화면 흐름
1. 프로필 선택 (`/profile-select`)
2. 기본정보 입력 (`/baseline-check`)
3. 기준 촬영 (`/baseline-setup`)
4. 루틴 홈 (`/mode`)
5. 운동 세션 (`/session`)
6. 결과 (`/result`)
7. 기록 조회 (`/history`)

## 3) PC1이 받는 핵심 값
- 프로필: id, name, 신체/목표 정보
- 기준 촬영 상태: face/body 완료 여부
- 루틴: calendar/day, routine_id, routine_day_id
- 세션 시작: session_id, ws_url
- 실시간 분석: posture/target/stability 관련 값
- 세션 결과: 운동 횟수, 좌우 카운트, 안정도/오류 요약
- 진행/코칭: progress, coach logs

## 4) PC1 연결 설정(가장 중요)
PC1 설치앱은 빌드 시점의 `VITE_PC3_URL`이 내부에 고정된다.

예시:
```env
VITE_PC3_URL=http://192.168.219.44:9000
VITE_DEVICE_ID=mirror_001
```

의미:
- `192.168.219.44` = PC3가 떠 있는 컴퓨터 IP
- `9000` = PC3 API 포트

## 5) 설치 후 다른 PC(PC3) 연결 방법
### A. 같은 네트워크인지 확인
- PC1 장비와 PC3 장비가 동일 LAN에 있어야 한다.

### B. PC3 주소 확인
- PC3 장비 IP와 포트(기본 9000) 확인

### C. 설치파일 생성 전 `.env` 반영
- `VITE_PC3_URL=http://<PC3_IP>:9000`으로 맞춘 뒤 설치파일 재빌드

### D. 설치 후 연결 점검
- PC1 실행 -> 프로필 목록이 뜨면 연결 정상
- 실패 시: 방화벽, IP/포트, PC3 서비스 실행 상태 확인

## 6) 발표용 한 줄
"PC1은 UI 전담 앱이고, PC3 주소(`VITE_PC3_URL`)만 맞으면 프로필-루틴-세션-결과 흐름이 그대로 동작한다."
