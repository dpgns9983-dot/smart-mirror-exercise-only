/**
 * PC1 coaching tone/safety alert composition helpers
 * Reads original PC3 fields and reconstructs display as "well done / improvement / safety alert"
 * Data contract (field names/sources) unchanged; only display layer modified.
 */

export type SafetyLevel = "danger" | "caution" | "safe" | "neutral";

const DANGER_KEYWORDS = [
  "pain",
  "dangerous",
  "injury",
  "fall",
  "통증",
  "위험",
  "부상",
  "넘어",
  "무리",
  "아픔",
];

function hasDangerKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return DANGER_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export function resolveSafetyLevel({
  warnings,
  stability,
  measurementQuality,
}: {
  warnings?: string[];
  stability?: number | null;
  measurementQuality?: string;
}): SafetyLevel {
  const warningText = (warnings ?? []).join(" ");

  if (
    hasDangerKeyword(warningText) ||
    (measurementQuality?.includes("낮") && (warnings?.length ?? 0) >= 1)
  ) {
    return "danger";
  }

  if ((warnings?.length ?? 0) >= 1 || (stability != null && stability < 0.5)) {
    return "caution";
  }

  if ((warnings?.length ?? 0) === 0 && stability != null && stability >= 0.7) {
    return "safe";
  }

  return "neutral";
}

export function composePositiveLine(
  level: SafetyLevel,
  exerciseLabel: string,
): string {
  switch (level) {
    case "danger":
      return "";
    case "caution":
      return `${exerciseLabel} 자세가 조금 흔들렸어요.`;
    case "safe":
      return `안정적인 자세를 잘 유지하셨습니다.`;
    case "neutral":
    default:
      return `${exerciseLabel} 운동을 마쳤어요.`;
  }
}

export function composeImprovementLines(
  displayLines: string[],
  warnings: string[],
  level: SafetyLevel,
): string[] {
  const result: string[] = [];

  if (level === "danger") {
    result.push("지금은 위험할 수 있어요. 운동을 멈추고 자세를 점검해요.");
  }

  result.push(...displayLines);

  if (level !== "danger") {
    result.push(...warnings);
  }

  return result;
}

export function composeSafetyAlert(
  level: SafetyLevel,
  warnings: string[],
): { headline: string; checklist: string[] } | null {
  if (level === "safe" || level === "neutral") {
    return null;
  }

  const checklist: string[] = [];

  if (level === "danger") {
    checklist.push("지금 통증이나 불편함이 있는지 확인해요");
    checklist.push("자세를 다시 한 번 점검해요");
    checklist.push("필요하면 운동을 중단하고 쉬어요");
  } else if (level === "caution") {
    checklist.push("다음 세트 전에 호흡과 정렬을 다시 잡아봐요");
    checklist.push("속도를 조금 천천히 해봐요");
  }

  checklist.push(...warnings);

  return {
    headline: level === "danger" ? "⚠️ 위험 경고" : "⚡ 자세 조정",
    checklist,
  };
}

export function composeEvidenceLabel(item: {
  exercise?: string | null;
  category?: string | null;
  title?: string | null;
  source_title?: string | null;
  summary?: string | null;
  text?: string | null;
}): string {
  if (item.title) return item.title;
  if (item.source_title) return item.source_title;
  if (item.summary) return item.summary;
  if (item.text) return item.text;

  const parts = [];
  if (item.exercise) parts.push(item.exercise);
  if (item.category) parts.push(item.category);
  return parts.length > 0 ? parts.join(" · ") : "운동 근거";
}

export function composeCoachLogTitle(log: {
  purpose?: string | null;
  finalResponse?: { summary?: string | null; mirror_message?: string | null } | null;
  pc2Output?: { summary?: string | null } | null;
}): string {
  if (log.finalResponse?.summary) return log.finalResponse.summary;
  if (log.finalResponse?.mirror_message) return log.finalResponse.mirror_message;
  if (log.pc2Output?.summary) return log.pc2Output.summary;
  return "코칭 기록";
}

export function composeCoachLogBody(log: {
  purpose?: string | null;
  createdAt?: string | null;
  finalResponse?: { warnings?: string[] | null } | null;
  pc2Output?: { summary?: string | null } | null;
}): string | null {
  const parts: string[] = [];

  if (log.purpose) {
    const purposeLabel = formatCoachPurpose(log.purpose);
    if (purposeLabel) parts.push(purposeLabel);
  }

  if (log.createdAt) {
    const time = log.createdAt.slice(11, 16);
    parts.push(`${time}`);
  }

  if (log.finalResponse?.warnings?.[0]) {
    parts.push(log.finalResponse.warnings[0]);
  } else if (log.pc2Output?.summary) {
    parts.push(log.pc2Output.summary);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatCoachPurpose(value?: string | null): string {
  if (!value) return "";

  const labels: Record<string, string> = {
    exercise_feedback: "운동 피드백",
    balance_feedback: "균형 피드백",
    pre_exercise_routine: "운동 전 루틴",
    post_exercise_coaching: "운동 후 코칭",
  };

  return labels[value] ?? value.replace(/_/g, " ");
}
