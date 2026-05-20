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

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(String).filter((item) => item.trim().length > 0);
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
  const postureErrors = toStringArray(featureValue(displayResult?.features, "posture_errors"));
  const postureErrorCount = postureErrors.length;
  const postureErrorTop3 = postureErrors.slice(0, 3);
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
  const previousWorkout = useMemo(() => {
    const workouts = progress?.recentWorkouts ?? [];
    return workouts.find((item) => {
      if (item.sessionId && result?.session_id && item.sessionId === result.session_id) {
        return false;
      }
      if (item.status === "skipped") {
        return false;
      }
      return typeof item.exerciseType === "string" && item.exerciseType === exerciseType;
    }) ?? null;
  }, [progress?.recentWorkouts, exerciseType, result?.session_id]);

  const previousStability = previousWorkout?.stabilityScore ?? null;
  const previousPostureErrorCount = previousWorkout?.postureErrors?.length ?? null;
  const currentStability = typeof stability === "number" ? stability : null;
  const stabilityDeltaPercent = currentStability != null && previousStability != null ? Math.round((currentStability - previousStability) * 100) : null;
  const postureErrorDelta = previousPostureErrorCount == null ? null : postureErrorCount - previousPostureErrorCount;
  const leftRightDiff = leftCount != null && rightCount != null ? Math.abs(leftCount - rightCount) : null;
  const balanceLabel = leftRightDiff == null ? "판단 불가" : leftRightDiff <= 1 ? "균형 좋음" : leftRightDiff <= 3 ? "조금 불균형" : "불균형 주의";
  const balanceToneClass = leftRightDiff == null ? "is-neutral" : leftRightDiff <= 1 ? "is-good" : leftRightDiff <= 3 ? "is-mid" : "is-bad";

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
          <div className={`result-balance-chip ${balanceToneClass}`}>
            <span>좌우 밸런스</span>
            <strong>{leftRightDiff == null ? "-" : `차이 ${leftRightDiff}회`}</strong>
            <em>{balanceLabel}</em>
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
          <div className="result-posture-card">
            <span>자세 오류 Top 3</span>
            {postureErrorTop3.length ? (
              <ul>
                {postureErrorTop3.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            ) : (
              <p>감지된 자세 오류가 없습니다.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">PROGRESS</span>
          <h2>최근 기록 {formatWeightDelta(progress?.weightDeltaKg ?? null)}</h2>
          <div className="result-improvement-strip">
            <div>
              <span>안정도 변화</span>
              <strong className={stabilityDeltaPercent == null ? "is-neutral" : stabilityDeltaPercent >= 0 ? "is-good" : "is-bad"}>
                {stabilityDeltaPercent == null ? "비교 불가" : `${stabilityDeltaPercent > 0 ? "+" : ""}${stabilityDeltaPercent}%`}
              </strong>
            </div>
            <div>
              <span>자세 오류 변화</span>
              <strong className={postureErrorDelta == null ? "is-neutral" : postureErrorDelta <= 0 ? "is-good" : "is-bad"}>
                {postureErrorDelta == null ? "비교 불가" : `${postureErrorDelta > 0 ? "+" : ""}${postureErrorDelta}개`}
              </strong>
            </div>
          </div>
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
