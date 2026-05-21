# PC1 Smart Mirror UI

PC1은 스마트 미러 화면 앱입니다. 프로필 선택, 기준 촬영, 루틴 확인, 운동 진행, 결과 리포트 화면을 담당하고 운동 분석과 코칭 데이터는 PC3에서 받습니다.

## 연결 구조

```text
PC1 UI / Camera -> PC3 Vision Gateway -> PC2 RAG Coaching
```

- PC1: Tauri/React 화면, 카메라 프레임 업로드, 사용자 흐름
- PC3: 프로필, 루틴, 세션, 자세 분석 API 중계
- PC2: RAG 기반 코칭 생성

PC1은 PC3 API만 호출합니다. PC2는 PC3 뒤에서 연결됩니다.

## 환경값

`.env` 또는 `.env.local`에 PC3 주소를 둡니다.

```env
VITE_PC3_URL=http://192.168.219.44:9000
VITE_DEVICE_ID=mirror_001
```

## 개발 실행

```bash
npm install
npm run tauri -- dev
```

개발 실행은 코드를 수정하면서 바로 확인할 때 사용합니다. 앱 창이 뜨고, PC3 주소는 `.env`의 `VITE_PC3_URL`을 사용합니다.

## PC3 연결 확인

```bash
node scripts/api_probe.mjs
```

기본 PC3 주소는 `.env`의 `VITE_PC3_URL`을 기준으로 확인합니다.

## 빌드

```bash
npm run build
```

React/Vite 화면 빌드만 확인할 때 사용합니다. 실제 설치 exe가 필요하면 Tauri 빌드를 실행합니다.

```bash
npm run tauri -- build
```

Tauri 빌드가 끝나면 설치 파일은 보통 아래 폴더에 생성됩니다.

```text
src-tauri\target\release\bundle\nsis
```

## 바탕화면 설치 파일 만들기

가장 쉬운 방법은 아래 스크립트를 실행하는 것입니다.

```bat
Build-PC1-Installer.cmd
```

스크립트는 Tauri 빌드를 실행하고, 생성된 설치 파일을 프로젝트 폴더의 `SmartMirror-PC1-Setup.exe`로 복사합니다.

바탕화면에 바로 복사하려면 PowerShell에서 아래 명령을 사용합니다.

```powershell
$installer = Get-ChildItem ".\src-tauri\target\release\bundle\nsis\*.exe" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

Copy-Item $installer.FullName "$env:USERPROFILE\Desktop\SmartMirror-PC1-Setup.exe" -Force
```

프로젝트 폴더에 만들어진 설치 파일을 바탕화면으로 복사할 때는 아래처럼 해도 됩니다.

```powershell
Copy-Item ".\SmartMirror-PC1-Setup.exe" "$env:USERPROFILE\Desktop\SmartMirror-PC1-Setup.exe" -Force
```

## 설치 앱 실행

바탕화면의 설치 파일을 실행해서 설치합니다.

```text
C:\Users\Admin\Desktop\SmartMirror-PC1-Setup.exe
```

설치 후 실제 실행 파일 위치는 보통 아래 경로입니다.

```text
C:\Users\Admin\AppData\Local\Smart Mirror\pc1-smart-mirror.exe
```

PowerShell에서 바로 실행할 때는 아래 명령을 사용할 수 있습니다.

```powershell
Start-Process "$env:LOCALAPPDATA\Smart Mirror\pc1-smart-mirror.exe"
```
