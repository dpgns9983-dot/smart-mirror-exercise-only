const BASE = process.env.PC3_URL || "http://192.168.219.44:9000";

async function call(name, path, init) {
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  const topKeys = json && typeof json === "object" && !Array.isArray(json) ? Object.keys(json) : [];
  return { name, status: res.status, json, topKeys, rawLength: text.length };
}

function pickProfiles(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.profiles)) return payload.profiles;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

function has(obj, key) {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
}

async function main() {
  const outputs = [];

  const profiles = await call("profiles", "/api/users/profiles");
  outputs.push(profiles);

  const list = pickProfiles(profiles.json);
  if (!list.length) {
    console.log(JSON.stringify({ base: BASE, error: "profiles_empty", outputs }, null, 2));
    process.exit(2);
  }

  const first = list[0];
  const userId = String(first.id ?? first.user_id ?? "");
  if (!userId) {
    console.log(JSON.stringify({ base: BASE, error: "missing_user_id", outputs }, null, 2));
    process.exit(3);
  }

  const progress = await call("progress", `/api/users/${encodeURIComponent(userId)}/progress?days=30`);
  outputs.push(progress);

  const start = await call("start", "/api/sessions/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, mode: "exercise", goal: "squat" }),
  });
  outputs.push(start);

  const sessionId = String(start.json?.session_id ?? "");
  let stop = null;
  let result = null;
  if (sessionId) {
    stop = await call("stop", `/api/sessions/${encodeURIComponent(sessionId)}/stop`, { method: "POST" });
    outputs.push(stop);

    result = await call("result", `/api/sessions/${encodeURIComponent(sessionId)}/result`);
    outputs.push(result);
  }

  const logs = await call("coach_logs", `/api/coach/logs/${encodeURIComponent(userId)}?limit=5`);
  outputs.push(logs);

  const finalJson = result?.json ?? stop?.json ?? {};
  const features = finalJson?.features ?? {};
  const ex = features?.exercise ?? {};
  const baselineDiff = finalJson?.baseline_diff;

  const capability = {
    posture_errors: has(ex, "posture_errors") || has(features, "posture_errors"),
    stability_score: has(ex, "stability_score") || has(features, "stability_score"),
    measurement_quality: has(ex, "measurement_quality") || has(features, "measurement_quality"),
    measurement_confidence: has(ex, "measurement_confidence") || has(features, "measurement_confidence"),
    baseline_diff_exists: baselineDiff && typeof baselineDiff === "object" ? Object.keys(baselineDiff).length > 0 : false,
    left_right_count: has(ex, "count_left") || has(ex, "count_right") || has(features, "count_left") || has(features, "count_right"),
    progress_recent_workouts: Array.isArray(progress.json?.recent_workouts) && progress.json.recent_workouts.length > 0,
    progress_avg_stability: progress.json?.workout_summary && has(progress.json.workout_summary, "avg_stability_score"),
  };

  const summary = outputs.map((o) => ({
    name: o.name,
    status: o.status,
    topKeys: o.topKeys,
  }));

  console.log(JSON.stringify({
    base: BASE,
    userId,
    sessionId,
    summary,
    capability,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
