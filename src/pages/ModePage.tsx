import { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import AppShell from "../components/AppShell";
import {
  generateRoutine,
  getBaselineStatus,
  getProgress,
  getRoutineCalendar,
  getRoutineDay,
  profileNeedsBaseline,
  routineFromDay,
  saveBodyMetric,
} from "../services/api";
import { useAppState } from "../state/AppContext";
import type { BodyMetricRecord, RoutineCalendar, RoutineDay } from "../types/domain";
import {
  EXERCISE_LABELS,
  formatExerciseTarget,
  friendlyError,
  monthEndIso,
  monthStartIso,
  shortDate,
  todayIso,
} from "../utils/format";

function weightByDate(metrics: BodyMetricRecord[]): Record<string, string> {
  return metrics.reduce<Record<string, string>>((result, metric) => {
    if (metric.measuredDate && metric.weightKg > 0) {
      result[metric.measuredDate] = `${metric.weightKg}kg`;
    }
    return result;
  }, {});
}

type RoutineReasonCard = {
  label: string;
  title: string;
  body: string;
};

const ROUTINE_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bsquat\b/gi, "스쿼트"],
  [/\bknee[_\s-]?raise\b/gi, "니 레이즈"],
  [/\bjumping[_\s-]?jack\b/gi, "점핑잭"],
  [/\blunge\b/gi, "런지"],
  [/\bpush[_\s-]?up\b/gi, "푸시업"],
  [/\bposture\b/gi, "자세"],
  [/\bbalance\b/gi, "균형"],
  [/\bstability\b/gi, "안정성"],
  [/\brhythm\b/gi, "리듬"],
  [/\bstrength\b/gi, "근력"],
  [/\bcardio\b/gi, "심폐"],
  [/\bmobility\b/gi, "가동성"],
  [/\bform[_\s-]?basics\b/gi, "기본 자세"],
  [/\bcommon[_\s-]?error(s)?\b/gi, "흔한 실수"],
  [/\bprogression\b/gi, "강도 조절"],
];

const ROUTINE_WARNING_TEXT = /(중단|멈추|통증|어지러움|불편|지원|받으세요|위험|응급)/;

function polishRoutineText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  let text = value.trim();
  if (!text || ROUTINE_WARNING_TEXT.test(text)) {
    return "";
  }

  for (const [pattern, replacement] of ROUTINE_TEXT_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(/[_]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

function chooseRoutineText(...values: unknown[]): string {
  for (const value of values) {
    const text = polishRoutineText(value);
    if (text) {
      return text;
    }
  }
  return "";
}

function buildRoutineReasonCards(day: RoutineDay | null, estimatedMinutes?: number | null): RoutineReasonCard[] {
  if (!day) {
    return [
      {
        label: "준비 중",
        title: "루틴이 준비되면 추천 이유가 표시됩니다.",
        body: "달력에 루틴이 배정되면 오늘 목적, 운동 포인트, 진행 강도를 함께 보여드릴게요.",
      },
    ];
  }

  const firstExercise = day.exercises[0] ?? null;
  const firstExerciseName = firstExercise ? EXERCISE_LABELS[firstExercise.exercise] : "첫 운동";
  const totalSets = day.exercises.reduce((sum, exercise) => sum + (exercise.sets ?? 1), 0);
  const firstTarget = firstExercise ? formatExerciseTarget(firstExercise.reps, firstExercise.durationSec) : "";
  const firstRest = firstExercise?.restSec ? `휴식 ${firstExercise.restSec}초` : "";
  const estimatedText = estimatedMinutes && estimatedMinutes > 0 ? `약 ${estimatedMinutes}분` : "짧게 시작";
  const intensityDetail = [firstTarget, firstRest].filter(Boolean).join(" · ");

  return [
    {
      label: "오늘의 목적",
      title: chooseRoutineText(day.focus, day.weeklyFocus, day.message) || "오늘 루틴의 목표를 확인해요",
      body: chooseRoutineText(day.summary, day.weeklyFocus) || "PC3가 달력에 배정한 루틴을 기준으로 오늘 할 운동을 정리했어요.",
    },
    {
      label: "운동 포인트",
      title: chooseRoutineText(firstExercise?.focus, firstExercise?.reason, day.focus) || `${firstExerciseName}를 천천히 시작해요`,
      body: chooseRoutineText(firstExercise?.howTo, firstExercise?.tips, firstExercise?.reason) || `${firstExerciseName}는 화면을 보며 정확한 자세와 리듬을 먼저 맞추면 좋아요.`,
    },
    {
      label: "진행 강도",
      title: day.exercises.length > 0 ? `${day.exercises.length}개 동작 · ${estimatedText}` : "운동 강도 확인 중",
      body:
        day.exercises.length > 0
          ? `${totalSets}세트 구성입니다.${intensityDetail ? ` 첫 동작은 ${intensityDetail}로 시작해요.` : " 오늘은 무리하지 않고 정확도를 먼저 보는 구성이에요."}`
          : "루틴이 준비되면 운동 개수와 예상 시간이 표시됩니다.",
    },
  ];
}

export default function ModePage({ navigate }: { navigate: NavigateFunction }) {
  const app = useAppState();
  const profile = app.activeProfile;
  const today = useMemo(todayIso, []);
  const [calendar, setCalendar] = useState<RoutineCalendar | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [todayDay, setTodayDay] = useState<RoutineDay | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<RoutineDay | null>(null);
  const [calendarWeights, setCalendarWeights] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDayLoading, setSelectedDayLoading] = useState(false);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState(profile?.weightKg ? String(profile.weightKg) : "");
  const [weightMemo, setWeightMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const calendarDays = calendar?.days ?? [];
  const todayRoutine = todayDay ? routineFromDay(todayDay) : null;
  const isTodaySelected = selectedDate === today;
  const selectedRoutine = selectedDayDetail ? routineFromDay(selectedDayDetail) : null;
  const canStart = Boolean(isTodaySelected && todayRoutine?.routineId && todayDay?.routineDayId && todayDay.exercises.length > 0);
  const canSaveWeight = isTodaySelected && !savingWeight;
  const routineReasonCards = useMemo(
    () => buildRoutineReasonCards(selectedDayDetail, selectedRoutine?.estimatedMinutes),
    [selectedDayDetail, selectedRoutine?.estimatedMinutes],
  );

  const loadHome = useCallback(async () => {
    if (!profile) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseline = await getBaselineStatus(profile.id);
      if (!baseline.face || !baseline.body) {
        throw new Error("기준 촬영이 완료되어야 오늘 운동을 시작할 수 있습니다.");
      }

      const [calendarData, progressData] = await Promise.all([
        getRoutineCalendar(profile.id, monthStartIso(today), monthEndIso(today)),
        getProgress(profile.id, 30),
      ]);
      setCalendar(calendarData);
      setCalendarWeights(weightByDate(progressData.bodyMetrics));
      const todayMetric = [...progressData.bodyMetrics].reverse().find((metric) => metric.measuredDate === today);
      if (todayMetric?.weightKg) {
        setWeightInput(String(todayMetric.weightKg));
      } else if (profile.weightKg) {
        setWeightInput(String(profile.weightKg));
      }
      setSelectedDate((current) => current || today);

      const todayInCalendar = calendarData.days.find((day) => day.date === today);
      if (!todayInCalendar?.routineId) {
        setTodayDay(null);
        setSelectedDayDetail((current) => (selectedDate === today ? null : current));
        app.setSelectedRoutine(null, null);
        return;
      }

      const day = await getRoutineDay(profile.id, today);
      setTodayDay(day);
      if (selectedDate === today) {
        setSelectedDayDetail(day);
      }
      app.setSelectedRoutine(routineFromDay(day), day);
    } catch (caught) {
      setTodayDay(null);
      setError(friendlyError(caught, "오늘 운동 정보를 불러오지 못했습니다. 다시 시도해주세요."));
    } finally {
      setLoading(false);
    }
  }, [app, profile, selectedDate, today]);

  useEffect(() => {
    if (!profile) {
      navigate("/profile-select", { replace: true });
      return;
    }
    if (profileNeedsBaseline(profile)) {
      navigate("/baseline-setup", { replace: true });
      return;
    }
    void loadHome();
  }, []);

  useEffect(() => {
    if (!profile || !calendar) {
      return;
    }
    const calendarDay = calendar.days.find((day) => day.date === selectedDate);
    if (!calendarDay?.routineId) {
      setSelectedDayDetail(null);
      setSelectedDayLoading(false);
      return;
    }
    if (selectedDate === today && todayDay) {
      setSelectedDayDetail(todayDay);
      setSelectedDayLoading(false);
      return;
    }
    let cancelled = false;
    setSelectedDayLoading(true);
    void getRoutineDay(profile.id, selectedDate)
      .then((day) => {
        if (!cancelled) {
          setSelectedDayDetail(day);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setSelectedDayDetail(null);
          setError(friendlyError(caught, "선택한 날짜의 루틴을 불러오지 못했습니다. 다시 시도해주세요."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSelectedDayLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [calendar, profile, selectedDate, today, todayDay]);

  if (!profile) {
    return null;
  }

  const generate = async () => {
    setRoutineLoading(true);
    setError(null);
    try {
      await generateRoutine(profile);
      await loadHome();
    } catch (caught) {
      setError(friendlyError(caught, "추천 루틴을 불러오지 못했습니다. 다시 시도해주세요."));
    } finally {
      setRoutineLoading(false);
    }
  };

  const startWorkout = () => {
    if (!todayRoutine || !todayDay || !canStart) {
      setError("운동 시작은 오늘 날짜에 등록된 루틴만 가능합니다.");
      return;
    }
    app.setSelectedRoutine(todayRoutine, todayDay);
    app.setWorkoutRun({ routine: todayRoutine, day: todayDay, currentIndex: 0, results: [] });
    navigate("/session");
  };

  const savePreWorkoutWeight = async () => {
    const weight = Number(weightInput);
    if (!isTodaySelected) {
      setError("몸무게 기록은 오늘 날짜에서만 저장할 수 있습니다.");
      return;
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      setError("몸무게를 숫자로 입력해주세요.");
      return;
    }
    setSavingWeight(true);
    setError(null);
    try {
      await saveBodyMetric(profile.id, weight, weightMemo.trim() || "pc1_pre_workout");
      const progressData = await getProgress(profile.id, 30);
      setCalendarWeights(weightByDate(progressData.bodyMetrics));
      setWeightMemo("");
    } catch (caught) {
      setError(friendlyError(caught, "운동 전 몸무게 기록을 저장하지 못했습니다. 다시 시도해주세요."));
    } finally {
      setSavingWeight(false);
    }
  };

  return (
    <AppShell title="ROUTINE" step="STEP 4">
      {error ? (
        <div className="inline-alert inline-alert--error">
          <span>{error}</span>
          <button type="button" onClick={() => void loadHome()}>
            재시도
          </button>
        </div>
      ) : null}
      {loading ? <div className="inline-alert">오늘 운동과 월간 달력을 불러오는 중입니다.</div> : null}

      <div className="mode-home-grid">
        <section className="panel calendar-panel calendar-panel--mode">
          <div className="panel-heading-row">
            <div>
              <span className="eyebrow">CALENDAR</span>
              <h2>루틴 달력</h2>
            </div>
            <button type="button" className="button button--ghost" onClick={() => navigate(`/history?date=${encodeURIComponent(selectedDate)}`)}>
              기록 보기
            </button>
          </div>
          <div className="calendar-strip calendar-strip--month">
            {calendarDays.map((day) => (
              <button
                key={day.date}
                type="button"
                className={[
                  day.date === selectedDate ? "is-selected" : "",
                  day.date === today ? "is-today" : "",
                  day.completed ? "is-done" : "",
                  day.skipped ? "is-skipped" : "",
                  day.routineId || calendarWeights[day.date] ? "" : "is-empty",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate(day.date)}
              >
                <strong>{shortDate(day.date)}</strong>
                <span>{day.focus ?? ""}</span>
                <em>{calendarWeights[day.date] ?? ""}</em>
              </button>
            ))}
          </div>
          <div className="calendar-legend" aria-label="달력 상태">
            <span className="is-selected">선택</span>
            <span className="is-today">오늘</span>
            <span className="is-done">완료</span>
            <span className="is-skipped">스킵</span>
          </div>
        </section>

        <section className="panel today-panel today-panel--mode">
          <span className="eyebrow">{isTodaySelected ? "TODAY" : shortDate(selectedDate)}</span>
          <h2>{selectedDayDetail?.message || selectedDayDetail?.focus || "선택 날짜 루틴 없음"}</h2>
          <p>
            {selectedDayLoading
              ? "선택한 날짜의 루틴을 불러오는 중입니다."
              : selectedDayDetail?.summary || selectedDayDetail?.weeklyFocus || "선택한 날짜에 등록된 루틴이 없습니다."}
          </p>
          <div className="routine-list routine-list--today">
            {selectedDayDetail?.exercises.map((exercise, index) => (
              <article key={`${exercise.exercise}-${index}`}>
                <span>{index + 1}</span>
                <strong>{EXERCISE_LABELS[exercise.exercise]}</strong>
                <em>
                  {exercise.sets ?? 1}세트 · {formatExerciseTarget(exercise.reps, exercise.durationSec)} · 휴식 {exercise.restSec ?? 45}초
                </em>
                <small>{exercise.focus || exercise.reason || "자세를 확인하며 진행"}</small>
              </article>
            ))}
            {!selectedDayDetail?.exercises.length ? <p className="empty-copy">달력에 루틴이 배정되면 여기에 표시됩니다.</p> : null}
          </div>
          <div className="routine-reason-card">
            <div className="routine-reason-card__head">
              <span className="eyebrow">RECOMMENDATION</span>
              <strong>왜 이 루틴인가요?</strong>
              <p>{selectedDayDetail ? "운동 전에 알아두면 좋은 내용만 간단히 정리했어요." : "루틴이 준비되면 추천 이유가 표시됩니다."}</p>
            </div>
            <div className="routine-reason-grid">
              {routineReasonCards.map((card) => (
                <article key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.title}</strong>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className={`today-weight-card${!isTodaySelected ? " is-disabled" : ""}`}>
            <div>
              <span className="eyebrow">BODY METRIC</span>
              <strong>운동 전 몸무게 기록</strong>
              <p>{isTodaySelected ? "오늘 운동을 시작하기 전에 몸무게를 남겨두면 달력과 기록 화면에 함께 표시됩니다." : "몸무게 기록은 오늘 날짜에서만 저장할 수 있습니다."}</p>
            </div>
            <div className="weight-form">
              <input value={weightInput} onChange={(event) => setWeightInput(event.target.value)} inputMode="decimal" placeholder="kg" disabled={!isTodaySelected} />
              <input value={weightMemo} onChange={(event) => setWeightMemo(event.target.value)} placeholder="메모" disabled={!isTodaySelected} />
              <button type="button" className="button button--primary" onClick={() => void savePreWorkoutWeight()} disabled={!canSaveWeight}>
                {savingWeight ? "저장 중" : "저장"}
              </button>
            </div>
          </div>
          <div className="footer-actions">
            <button type="button" className="button button--primary" onClick={startWorkout} disabled={!canStart}>
              {isTodaySelected ? "운동 시작" : "오늘만 시작 가능"}
            </button>
            {isTodaySelected && !canStart ? (
              <button type="button" className="button button--ghost" onClick={() => void generate()} disabled={routineLoading}>
                {routineLoading ? "생성 중" : "추천 루틴 생성"}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
