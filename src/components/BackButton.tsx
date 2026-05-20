import { useLocation, useNavigate } from "react-router-dom";

const ROUTE_FALLBACKS: Record<string, string> = {
  "/profile-select": "/profile-select",
  "/baseline-check": "/profile-select",
  "/baseline-setup": "/baseline-check",
  "/mode": "/profile-select",
  "/session": "/mode",
  "/result": "/mode",
  "/history": "/mode",
};

type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
  className?: string;
  onBeforeBack?: () => void;
};

export default function BackButton({ fallbackTo, label = "이전", className = "", onBeforeBack }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    onBeforeBack?.();
    const historyIndex = typeof window !== "undefined" ? window.history.state?.idx : null;
    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo ?? ROUTE_FALLBACKS[location.pathname] ?? "/profile-select");
  };

  return (
    <button type="button" className={`back-button ${className}`.trim()} onClick={goBack} aria-label="이전 화면으로 이동">
      <span aria-hidden="true">{"<"}</span>
      {label}
    </button>
  );
}
