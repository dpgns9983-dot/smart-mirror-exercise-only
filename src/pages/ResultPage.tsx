import { useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import AppShell from "../components/AppShell";
import { getProgress, getSessionResult } from "../services/api";
import { useAppState } from "../state/AppContext";
import type { EvidenceItem, ProgressResponse, SessionFinalResponse } from "../types/domain";
import { formatCategoryLabel, formatExerciseName, formatMeasurementQuality, formatPostureError, todayIso } from "../utils/format";
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

function scoreLabel(value: number | null): string {
  return value === null ? "-" : `${Math.round(value * 100)}%`;
}

function balanceLabel(leftCount: number | null, rightCount: number | null): string {
  if (leftCount === null || rightCount === null) {
    return "판단 보류";
  }
  const diff = Math.abs(leftCount - rightCount);
  if (diff <= 1) {
    return "좌우 균형 좋음";
  }
  if (diff <= 3) {
    return "조금 차이 있음";
  }
  return "좌우 차이 주의";
}

function detailText(item: EvidenceItem): string {
  return item.summary ?? item.text ?? item.title ?? item.source_title ?? "PC3가 함께 전달한 참고 근거입니다.";
}

function detailLabel(item: EvidenceItem): string {
  const category = formatCategoryLabel(item.category ?? item.category_label);
  const exercise = formatExerciseName(item.exercise ?? item.exercise_label);
  return [exercise, category].filter(Boolean).join(" · ") || "코칭 근거";
}

export default function ResultPage({ navigate }: { navigate: NavigateFunction }) {
  const app = useAppState();
  const result = app.lastResult;
  const profile = app.activeProfile;
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [storedResult, setStoredResult] = useState<SessionFinalResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const displayResult = storedResult ?? result;
  const exerciseType = String(featureValue(displayResult?.features, "type") ?? app.selectedRoutine?.startExerciseType ?? "squat");
  const count = Number(featureValue(displayResult?.features, "count") ?? 0);
  const leftCount = toNumber(featureValue(displayResult?.features, "count_left"));
  const rightCount = toNumber(featureValue(displayResult?.features, "count_right"));
  const stability = featureValue(displayResult?.features, "stability_score");
  const stabilityValue = typeof stability === "number" ? stability : null;
  const measurementQuality = formatMeasurementQuality(String(featureValue(displayResult?.features, "measurement_quality") ?? ""));
  const postureErrors = toStringArray(featureValue(displayResult?.features, "posture_errors"));
  const warnings = displayResult?.coaching?.warnings ?? [];
  const displayLines = displayResult?.coaching?.pc2_payload?.display_lines ?? [];
  const evidence = displayResult?.coaching?.pc2_payload?.evidence ?? [];
  const message = displayResult?.coaching?.mirror_message ?? displayResult?.coaching?.summary ?? "운동 결과를 정리했습니다.";
  const exerciseLabel = useMemo(() => formatExerciseName(exerciseType), [exerciseType]);

  const safetyLevel = resolveSafetyLevel({
    warnings,
    stability: stabilityValue,
    measurementQuality,
  });
  const positiveMessage = composePositiveLine(safetyLevel, exerciseLabel, stabilityValue === null ? null : Math.round(stabilityValue * 100));
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
  const currentStability = stabilityValue;
  const stabilityDeltaPercent = currentStability != null && previousStability != null ? Math.round((currentStability - previousStability) * 100) : null;
  const previousPostureErrorCount = previousWorkout?.postureErrors?.length ?? null;
  const postureErrorDelta = previousPostureErrorCount == null ? null : postureErrors.length - previousPostureErrorCount;
  const statusLabel = displayResult?.status === "skipped" ? "건너뜀" : "완료";
  const savedLabel = storedResult ? "PC3 저장 결과 확인 완료" : result?.session_id ? "PC3 저장 결과 확인 중" : "이번 세션 기록";
  const resultDate = app.selectedDay?.scheduledDate ?? todayIso();

  if (!result) {
    return (
      <AppShell title="결과" subtitle="표시할 결과가 없습니다.">
        <button type="button" className="button button--primary" onClick={() => navigate("/mode")}>
          루틴으로
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="결과"
      step="6단계"
      subtitle="운동 직후에 필요한 내용만 먼저 정리했어요."
      footer={
        <div className="footer-actions">
          <button type="button" className="button button--ghost" onClick={() => navigate("/mode")}>
            루틴으로
          </button>
          {result.session_id ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate(`/history?date=${encodeURIComponent(resultDate)}&session_id=${encodeURIComponent(result.session_id)}`)}
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
      <div className="result-grid result-grid--coach">
        <section className="panel result-hero result-hero--coach">
          <div>
            <span className="eyebrow">운동 완료</span>
            <h2>{exerciseLabel}</h2>
            <p>{message}</p>
          </div>
          <div className="result-count-tile">
            <span>{statusLabel}</span>
            <strong>{displayResult?.status === "skipped" ? "건너뜀" : count}</strong>
            <em>{savedLabel}</em>
          </div>
        </section>

        <section className="panel result-coach-card result-coach-card--good">
          <span className="eyebrow">오늘 잘한 점</span>
          <h3>{positiveMessage}</h3>
          <p>측정 상태는 {measurementQuality}이고, 안정도는 {scoreLabel(stabilityValue)}로 기록됐습니다.</p>
        </section>

        <section className="panel result-coach-card result-coach-card--next">
          <span className="eyebrow">다음엔 이렇게</span>
          <h3>다음 운동에서 바로 써먹을 포인트예요.</h3>
          <ul className="result-action-list">
            {improvementLines.slice(0, 3).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
          </ul>
        </section>

        <section className="panel result-record-card">
          <div className="panel-heading-row">
            <div>
              <span className="eyebrow">오늘 기록</span>
              <h3 className="result-panel-title">핵심 수치</h3>
            </div>
            <button type="button" className="button button--ghost" onClick={() => setDetailsOpen((value) => !value)}>
              {detailsOpen ? "자세 상세 접기" : "자세 상세 보기"}
            </button>
          </div>
          <div className="result-record-grid">
            <div><span>횟수</span><strong>{count}</strong></div>
            <div><span>안정도</span><strong>{scoreLabel(stabilityValue)}</strong></div>
            <div><span>좌우 균형</span><strong>{balanceLabel(leftCount, rightCount)}</strong></div>
            <div><span>측정 상태</span><strong>{measurementQuality}</strong></div>
          </div>
        </section>

        {detailsOpen ? (
          <section className="panel result-detail-card">
            <span className="eyebrow">상세 기록</span>
            <div className="result-detail-grid">
              <article>
                <h3>자세 요약</h3>
                {postureErrors.length ? (
                  <ul>
                    {postureErrors.slice(0, 4).map((item, index) => <li key={`${item}-${index}`}>{formatPostureError(item)}</li>)}
                  </ul>
                ) : (
                  <p>감지된 자세 오류가 없습니다.</p>
                )}
              </article>
              <article>
                <h3>지난번과 비교</h3>
                <p>안정도 변화: {stabilityDeltaPercent == null ? "비교 불가" : `${stabilityDeltaPercent > 0 ? "+" : ""}${stabilityDeltaPercent}%`}</p>
                <p>자세 오류 변화: {postureErrorDelta == null ? "비교 불가" : `${postureErrorDelta > 0 ? "+" : ""}${postureErrorDelta}개`}</p>
              </article>
              <article className="result-detail-card__wide">
                <h3>PC3/PC2 근거</h3>
                {evidence.length ? (
                  <div className="result-evidence-list">
                    {evidence.slice(0, 4).map((item, index) => (
                      <div key={`${item.id ?? item.source_id ?? index}`}>
                        <strong>{detailLabel(item)}</strong>
                        <p>{detailText(item)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>이번 결과에 표시할 근거가 없습니다.</p>
                )}
              </article>
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
