# PC1 Smart Mirror UI

PC1 is the smart mirror screen app. It owns profile UI, camera capture, workout home, workout session, result, and coaching display.

Runtime connection is fixed:

```text
PC1 UI -> PC3 Vision Gateway -> PC2 NVIDIA/RAG Engine
```

PC1 calls only PC3. PC1 does not call PC2, NVIDIA APIs, or databases directly.

## Installer Build

Before building an installer for another computer, set the PC3 address in `.env`.

```env
VITE_PC3_URL=http://<PC3_LAN_IP>:9000
VITE_DEVICE_ID=mirror_001
```

For local development with PC1, PC2, and PC3 on the same machine:

```env
VITE_PC3_URL=http://127.0.0.1:9000
VITE_DEVICE_ID=mirror_001
```

Run this file from the repository root:

```text
Build-PC1-Installer.cmd
```

The installer is copied to the repository root:

```text
SmartMirror-PC1-Setup.exe
```

Important: the Tauri installer embeds `VITE_PC3_URL` at build time. If the PC3 IP changes, update `.env` and rebuild the installer.

## Development

```powershell
npm install
npm run tauri -- dev
```

Build check:

```powershell
npm run build
```

## Contract Rules

- API base uses only `VITE_PC3_URL`.
- PC1 must not add any direct PC2, NVIDIA, or database connection.
- Profile source of truth is PC3: `GET/POST/PUT/DELETE /api/users/profiles`.
- Do not restore profile source data from legacy local caches; localStorage may only cache the last selected profile ID.
- Profile enums must use only PC3 contract values.
- Empty limitations must be sent as `[]`, not as a string.
- Baseline slots are only `face_front` and `body_front_full`.
- Starting a workout from today's routine sends `routine_id` and `routine_day_id` to `/api/sessions/start`.
- PC1 connects to the `ws_url` returned by `/api/sessions/start`.
- PC1 uploads exercise frames to `/api/analyze/exercise` while the session is running.
- PC1 displays PC3 response fields such as `pc2_payload.display_lines`, `pc2_payload.evidence`, routine evidence, coaching evidence, and `weekly_adjustment` without reinterpreting them.

## PC3 APIs Used By PC1

- `GET /api/users/profiles`
- `POST /api/users/profiles`
- `PUT /api/users/profiles/{user_id}`
- `DELETE /api/users/profiles/{user_id}`
- `GET /api/baselines/users/{user_id}`
- `POST /api/baselines/users/{user_id}/capture`
- `POST /api/routines/profile`
- `GET /api/routines/profile/{user_id}/day?target_date=YYYY-MM-DD`
- `GET /api/routines/profile/{user_id}/calendar?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`
- `POST /api/users/{user_id}/body-metrics`
- `GET /api/users/{user_id}/progress?days=30`
- `GET /api/coach/logs/{user_id}?limit=100`
- `POST /api/sessions/start`
- `POST /api/analyze/exercise`
- `POST /api/sessions/{session_id}/stop`
- `POST /api/sessions/{session_id}/skip`
- `GET /api/sessions/{session_id}/result`
- `WS /ws/sessions/{session_id}`

## Camera

PC1 uses the default webcam recognized by Windows. If the camera does not open, check Windows camera permissions, whether another app is using the camera, and then restart PC1.
