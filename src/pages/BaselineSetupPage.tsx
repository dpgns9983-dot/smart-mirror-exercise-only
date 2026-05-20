import { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import BackButton from "../components/BackButton";
import { useCamera } from "../hooks/useCamera";
import { captureBaseline, getBaselineStatus } from "../services/api";
import { useAppState } from "../state/AppContext";
import type { BaselineSlot } from "../types/domain";
import { friendlyError } from "../utils/format";

const SLOT_ORDER: BaselineSlot[] = ["face_front", "body_front_full"];
const SLOT_LABEL: Record<BaselineSlot, string> = {
  face_front: "얼굴 정면",
  body_front_full: "전신 정면",
};
const AUTO_CAPTURE_SECONDS = 3;

export default function BaselineSetupPage({ navigate }: { navigate: NavigateFunction }) {
  const app = useAppState();
  const profile = app.activeProfile;
  const camera = useCamera();
  const [completed, setCompleted] = useState<Record<BaselineSlot, boolean>>({ face_front: false, body_front_full: false });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("카메라를 켜고 기준 촬영을 준비하고 있습니다.");
  const [error, setError] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState(AUTO_CAPTURE_SECONDS);
  const [retrySeed, setRetrySeed] = useState(0);

  const currentSlot = useMemo(() => SLOT_ORDER.find((slot) => !completed[slot]) ?? null, [completed]);
  const progressLabel = currentSlot ? `${SLOT_ORDER.indexOf(currentSlot) + 1}/${SLOT_ORDER.length}` : "완료";

  useEffect(() => {
    void camera.start();
  }, [camera.start]);

  const finalize = useCallback(
    async (nextCompleted: Record<BaselineSlot, boolean>) => {
      if (!profile || !nextCompleted.face_front || !nextCompleted.body_front_full) {
        return;
      }
      setMessage("저장된 기준 촬영 상태를 확인하고 있습니다.");
      const status = await getBaselineStatus(profile.id);
      if (!status.face || !status.body) {
        throw new Error("기준 촬영 저장 상태를 확인하지 못했습니다. 다시 촬영해주세요.");
      }
      const readyProfile = {
        ...profile,
        status: "ready" as const,
        baselineSlots: { face_front: true, body_front_full: true },
        lastUsedAt: new Date().toISOString(),
      };
      app.upsertProfile(readyProfile);
      app.setActiveProfileId(readyProfile.id);
      navigate("/mode", { replace: true });
    },
    [app, navigate, profile],
  );

  const capture = useCallback(async () => {
    if (!profile || !currentSlot || submitting || camera.status !== "ready") {
      return;
    }

    const slot = currentSlot;
    setSubmitting(true);
    setError(null);
    setMessage(`${SLOT_LABEL[slot]} 촬영을 PC3에 저장하고 있습니다.`);
    try {
      const blob = await camera.capture(slot === "face_front" ? 0.72 : 0.84);
      if (!blob) {
        throw new Error("카메라 프레임을 가져오지 못했습니다.");
      }
      const result = await captureBaseline(profile.id, slot, blob);
      if (!result.valid) {
        throw new Error(result.reason ?? "기준 촬영을 인식하지 못했습니다. 자세를 맞추고 다시 시도해주세요.");
      }
      const next = { ...completed, [slot]: true };
      setCompleted(next);
      app.updateActiveProfile({ baselineSlots: next });
      setMessage(`${SLOT_LABEL[slot]} 저장 완료.`);
      await finalize(next);
    } catch (caught) {
      setError(friendlyError(caught, "기준 촬영을 저장하지 못했습니다. 다시 시도해주세요."));
      setMessage("촬영 위치를 조정한 뒤 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }, [app, camera, completed, currentSlot, finalize, profile, submitting]);

  useEffect(() => {
    if (!profile || !currentSlot || submitting || error || camera.status !== "ready") {
      return;
    }

    setAutoCountdown(AUTO_CAPTURE_SECONDS);
    setMessage(`${SLOT_LABEL[currentSlot]} 자세를 맞춰주세요. ${AUTO_CAPTURE_SECONDS}초 뒤 자동 촬영합니다.`);

    let cancelled = false;
    const timer = window.setInterval(() => {
      setAutoCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (!cancelled) {
            void capture();
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [camera.status, capture, currentSlot, error, profile, retrySeed, submitting]);

  if (!profile) {
    return (
      <main className="capture-page">
        <BackButton fallbackTo="/profile-select" />
        <button type="button" className="button button--primary" onClick={() => navigate("/profile-select")}>
          프로필 선택
        </button>
      </main>
    );
  }

  const retryAutoCapture = () => {
    setError(null);
    setAutoCountdown(AUTO_CAPTURE_SECONDS);
    setRetrySeed((value) => value + 1);
  };

  return (
    <main className={`capture-page capture-page--${currentSlot ?? "done"}`}>
      <BackButton fallbackTo="/baseline-check" />
      <video ref={camera.videoRef} className="capture-video" autoPlay muted playsInline />
      {camera.status !== "ready" ? (
        <div className="camera-placeholder">
          <p>{camera.error ?? "카메라를 준비하고 있습니다."}</p>
          <button type="button" className="button button--primary" onClick={() => void camera.start()}>
            카메라 연결
          </button>
        </div>
      ) : null}
      <div className={`capture-guide capture-guide--${currentSlot ?? "done"}`} aria-hidden="true" />
      {currentSlot && camera.status === "ready" ? (
        <aside className={`capture-countdown ${submitting ? "is-saving" : ""}`} aria-live="polite">
          <span>{submitting ? "저장 중" : "자동 촬영"}</span>
          <strong>{submitting ? "..." : autoCountdown}</strong>
          <em>{submitting ? "PC3가 촬영본을 확인하고 있습니다." : `${SLOT_LABEL[currentSlot]} 위치에 맞춰주세요.`}</em>
        </aside>
      ) : null}
      <aside className="capture-toast" role={error ? "alert" : "status"}>
        {error ?? message}
      </aside>
      <footer className="capture-bar">
        <div>
          <span>현재</span>
          <strong>{currentSlot ? SLOT_LABEL[currentSlot] : "완료"}</strong>
          <em>{progressLabel}</em>
        </div>
        <div className="capture-steps">
          {SLOT_ORDER.map((slot) => (
            <span key={slot} className={`${slot === currentSlot ? "is-active" : ""} ${completed[slot] ? "is-done" : ""}`}>
              {SLOT_LABEL[slot]}
            </span>
          ))}
        </div>
        {error ? (
          <button type="button" className="button button--primary" onClick={retryAutoCapture} disabled={!currentSlot || camera.status !== "ready"}>
            다시 자동 촬영
          </button>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => void capture()} disabled={!currentSlot || submitting || camera.status !== "ready"}>
            지금 촬영
          </button>
        )}
      </footer>
    </main>
  );
}
