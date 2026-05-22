# 변경 이력 (Changelog)

이 파일은 PC1 Smart Mirror UI 의 주요 변경 사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/) 를 따르고, 커밋은 [Conventional Commits](https://www.conventionalcommits.org/) 스타일을 사용합니다.

## [0.1.0] - 2026-05-22

발표 직후 포트폴리오용으로 저장소를 정리한 첫 공개 버전입니다.

### Added (추가)
- 프로필 선택 → 기본 정보 입력 → 기준 촬영 → 모드 선택 → 운동 세션 → 결과 리포트로 이어지는 전체 화면 흐름
- PC3 비전 게이트웨이 / PC2 RAG 코칭 API 와 연동되는 서비스 레이어 (`src/services/api.ts`)
- 결과 화면 8패널 구성: 핵심 지표, 자세 분석, 코칭 메시지, 안전 경보 등
- 운동·휴식 화면 카메라 배경 + 양측 그라디언트 플로팅 패널 레이아웃
- 휴식 타이머 (`RestTimer`) 및 공통 뒤로가기 버튼 (`BackButton`)
- 프로필별 사진 저장 (`profilePhoto`) 과 일자별 메모 (`dayNotes`) 로컬 저장 기능
- 한 번 클릭으로 Tauri NSIS 설치 파일을 만드는 `Build-PC1-Installer.cmd`

### Changed (변경)
- 결과 화면을 핵심 정보 중심으로 재구성하고, 카드 갯수에 따라 레이아웃 자동 최적화
- 자세 오류·운동 중 상태 문구를 한글로 정규화 (`utils/format.ts`, `utils/coachingCopy.ts`)
- 루틴 준비 상태에 맞춰 CTA 문구가 자연스럽게 바뀌도록 UX 개선
- 결과 화면 코칭 톤 정비 및 안전 경보 표시 도입

### Fixed (수정)
- 루틴이 자동으로 준비되지 않던 문제 보정
- 결과 화면의 영문 자세 오류가 그대로 노출되던 문제 한글화
- 운동 중 상태 문구가 환경마다 다르게 표시되던 문제 정규화

### Removed (제거)
- 발표용 흐름 문서 `PPT_FLOW_SUMMARY_KO.md`
- 개발 중 사용하던 수동 API 테스트 파일 `test-api.http`
- PC3 연결 점검 스크립트 `scripts/api_probe.mjs`
- 데모용으로 잠시 넣었던 화면 전역 임시 버튼
- Git 추적에서 로컬 환경 파일 `.env` 제외 (`.env.example` 만 저장소에 남김)

[0.1.0]: https://github.com/
