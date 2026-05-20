import { useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import AppShell from "../components/AppShell";
import { getProgress, getSessionResult } from "../services/api";
import { useAppState } from "../state/AppContext";
import type { ProgressResponse, SessionFinalResponse } from "../types/domain";
import { formatDuration, formatExerciseName, formatWeightDelta, todayIso } from "../utils/format";
import {
  composeImprovementLines,
  composePositiveLine,
  resolveSafetyLevel,
} from "../utils/coachingCopy";

function featureValue(features: Record<string, unknown> | undefined, key: string): unknown {
  const exercise = features?.exercise;
  if (exercise && typeof exercise === "object" && key in exercise) {
    return (exercise as Record<string, unknown>)[key];
  }
  return features?.[key];
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export default function ResultPage({ navigate }: { navigate: NavigateFunction }) {
  const app = useAppState();
  const result = app.lastResult;
  const profile = app.activeProfile;
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [storedResult, setStoredResult] = useState<SessionFinalResponse | null>(null);

  const displayResult = storedResult ?? result;
  const exerciseType = String(featureValue(displayResult?.features, "type") ?? app.selectedRoutine?.startExerciseType ?? "squat");
  const count = Number(featureValue(displayResult?.features, "count") ?? 0);
  const leftCount = toNumber(featureValue(displayResult?.features, "count_left"));
  const rightCount = toNumber(featureValue(displayResult?.features, "count_right"));
  const stability = featureValue(displayResult?.features, "stability_score");
  const stabilityPercent = typeof stability === "number" ? Math.round(stability * 100) : null;
  const measurementQuality = String(featureValue(displayResult?.features, "measurement_quality") ?? "기록 없음");
  const measurementConfidence = toNumber(featureValue(displayResult?.features, "measurement_confidence"));
  const measurementConfidencePercent = measurementConfidence == null ? null : Math.round(measurementConfidence * 100);
  const warnings = displayResult?.coaching?.warnings ?? [];
  const displayLines = displayResult?.coaching?.pc2_payload?.display_lines ?? [];
  const message = displayResult?.coaching?.mirror_message ?? displayResult?.coaching?.summary ?? "운동 결과를 정리했습니다.";

  // 안전 레벨 결정
  const safetyLevel = resolveSafetyLevel({
    warnings,
    stability: typeof stability === "number" ? stability : null,
    measurementQuality,
  });
  const positiveMessage = composePositiveLine(
    safetyLevel,
    formatExerciseName(exerciseType),
  );
  const improvementLines = composeImprovementLines(displayLines, warnings, safetyLevel);

  useEffect(() => {
    if (!profile) {
      return;
    }
    let alive = true;
    void getProgress(profile.id, 30).then((data) => alive && setProgress(data)).catch(() => alive && setProgress(null));
    return () => {
      alive = false;
    };
  }, [profile, result?.session_id]);

  useEffect(() => {
    if (!result?.session_id || result.session_id.startsWith("demo")) {
      return;
    }
    let alive = true;
    void getSessionResult(result.session_id)
      .then((stored) => {
        if (alive) {
          setStoredResult(stored);
        }
      })
      .catch(() => {
        // 저장 결과 재조회 실패 시 직전 메모리 결과를 그대로 사용한다.
      });
    return () => {
      alive = false;
    };
  }, [result?.session_id]);

  const summary = progress?.workoutSummary;
  const exerciseLabel = useMemo(() => formatExerciseName(exerciseType), [exerciseType]);

  if (!result) {
    return (
      <AppShell title="RESULT" subtitle="표시할 결과가 없습니다.">
        <button type="button" className="button button--primary" onClick={() => navigate("/mode")}>
          루틴으로
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="RESULT"
      step="STEP 6"
      subtitle={`${profile?.name ?? "사용자"}님의 운동 결과와 PC3 저장 기록입니다.`}
      footer={
        <div className="footer-actions">
          <button type="button" className="button button--ghost" onClick={() => navigate("/mode")}>
            루틴으로
          </button>
          {result.session_id ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate(`/history?date=${encodeURIComponent(app.selectedDay?.scheduledDate ?? todayIso())}&session_id=${encodeURIComponent(result.session_id)}`)}
            >
              기록에서 보기
            </button>
          ) : null}
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              app.resetWorkout();
              app.setActiveProfileId(null);
              navigate("/profile-select");
            }}
          >
            프로필로
          </button>
        </div>
      }
    >
      <div className="result-grid">
        <section className="panel result-hero">
          <span className="eyebrow">SESSION</span>
          <h2>{exerciseLabel}</h2>
          <strong>{displayResult?.status === "skipped" ? "SKIP" : count}</strong>
          <p>{message}</p>
          <div className="result-kpi-mini">
            <div>
              <span>왼쪽</span>
              <strong>{leftCount ?? "-"}</strong>
            </div>
            <div>
              <span>오른쪽</span>
              <strong>{rightCount ?? "-"}</strong>
            </div>
            <div>
              <span>신뢰도</span>
              <strong>{measurementConfidencePercent == null ? "-" : `${measurementConfidencePercent}%`}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">COACHING</span>
          <h2>코칭 요약</h2>
          {positiveMessage && <p><strong>{positiveMessage}</strong></p>}
          {improvementLines.length ? (
            <>
              <p style={{ marginTop: "0.5em", fontSize: "0.9em", opacity: 0.8 }}>다음 세트에서 개선할 점</p>
              <ul>
                {improvementLines.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
              </ul>
            </>
          ) : null}
        </section>

        <section className="panel">
          <span className="eyebrow">PROGRESS</span>
          <h2>최근 기록 {formatWeightDelta(progress?.weightDeltaKg ?? null)}</h2>
          <div className="stats-grid">
            <div><span>세션</span><strong>{summary?.sessionCount ?? 0}</strong></div>
            <div><span>운동</span><strong>{summary?.workoutCount ?? 0}</strong></div>
            <div><span>스킵</span><strong>{summary?.skippedCount ?? 0}</strong></div>
            <div><span>총 횟수</span><strong>{summary?.totalReps ?? 0}</strong></div>
            <div><span>시간</span><strong>{formatDuration(summary?.totalDurationSec)}</strong></div>
            <div><span>안정도</span><strong>{stabilityPercent ?? (summary?.avgStabilityScore == null ? "-" : Math.round(summary.avgStabilityScore * 100))}%</strong></div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
