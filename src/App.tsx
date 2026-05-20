import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { hasRequiredProfileInput, profileNeedsBaseline } from "./services/api";
import { useAppState } from "./state/AppContext";
import BaselineSetupPage from "./pages/BaselineSetupPage";
import HistoryPage from "./pages/HistoryPage";
import ModePage from "./pages/ModePage";
import ProfileInputPage from "./pages/ProfileInputPage";
import ProfileSelectPage from "./pages/ProfileSelectPage";
import ResultPage from "./pages/ResultPage";
import SessionPage from "./pages/SessionPage";

function GuardedProfileInput() {
  const app = useAppState();
  const navigate = useNavigate();
  if (!app.activeProfile) {
    return <Navigate to="/profile-select" replace />;
  }
  return <ProfileInputPage navigate={navigate} />;
}

function GuardedBaseline() {
  const app = useAppState();
  const navigate = useNavigate();
  if (!app.activeProfile) {
    return <Navigate to="/profile-select" replace />;
  }
  if (app.activeProfile && !hasRequiredProfileInput(app.activeProfile)) {
    return <Navigate to="/baseline-check" replace />;
  }
  return <BaselineSetupPage navigate={navigate} />;
}

function GuardedMode() {
  const app = useAppState();
  const navigate = useNavigate();
  if (!app.activeProfile) {
    return <Navigate to="/profile-select" replace />;
  }
  if (app.activeProfile && !hasRequiredProfileInput(app.activeProfile)) {
    return <Navigate to="/baseline-check" replace />;
  }
  if (app.activeProfile && profileNeedsBaseline(app.activeProfile)) {
    return <Navigate to="/baseline-setup" replace />;
  }
  return <ModePage navigate={navigate} />;
}

function GuardedSession() {
  const app = useAppState();
  const navigate = useNavigate();
  if (!app.activeProfile) {
    return <Navigate to="/profile-select" replace />;
  }
  if (!app.workoutRun || !app.selectedRoutine) {
    return <Navigate to="/mode" replace />;
  }
  return <SessionPage navigate={navigate} />;
}

function GuardedResult() {
  const navigate = useNavigate();
  return <ResultPage navigate={navigate} />;
}

function GuardedHistory() {
  const app = useAppState();
  const navigate = useNavigate();
  if (!app.activeProfile) {
    return <Navigate to="/profile-select" replace />;
  }
  return <HistoryPage navigate={navigate} />;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const tempButtonNext = () => {
    // 현재 경로에서 다음 경로로 이동하는 데모 로직
    const routeMap: Record<string, string> = {
      "/": "/profile-select",
      "/profile-select": "/baseline-check",
      "/baseline-check": "/baseline-setup",
      "/baseline-setup": "/mode",
      "/mode": "/session",
      "/session": "/result",
      "/result": "/history",
      "/history": "/mode",
    };

    const nextPath = routeMap[location.pathname] || "/profile-select";
    navigate(nextPath);
  };

  return (
    <>
      {/* TEMP_UI_BUTTON_START */}
      <button
        type="button"
        className="temp-quick-button"
        onClick={tempButtonNext}
      >
        임시 버튼
      </button>
      {/* TEMP_UI_BUTTON_END */}

      <Routes>
        <Route path="/" element={<Navigate to="/profile-select" replace />} />
        <Route path="/profile-select" element={<ProfileSelectPage navigate={navigate} />} />
        <Route path="/baseline-check" element={<GuardedProfileInput />} />
        <Route path="/baseline-setup" element={<GuardedBaseline />} />
        <Route path="/mode" element={<GuardedMode />} />
        <Route path="/session" element={<GuardedSession />} />
        <Route path="/camera" element={<Navigate to="/session" replace />} />
        <Route path="/result" element={<GuardedResult />} />
        <Route path="/history" element={<GuardedHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
