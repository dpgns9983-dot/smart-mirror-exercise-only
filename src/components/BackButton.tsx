import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
  className?: string;
  onBeforeBack?: () => void;
};

export default function BackButton({ fallbackTo, label = "이전", className = "", onBeforeBack }: BackButtonProps) {
  const navigate = useNavigate();

  const goBack = () => {
    onBeforeBack?.();
    const historyIndex = typeof window !== "undefined" ? window.history.state?.idx : null;
    const canUseBrowserBack =
      typeof historyIndex === "number"
        ? historyIndex > 0
        : typeof window !== "undefined" && window.history.length > 1;

    if (canUseBrowserBack) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo ?? "/profile-select");
  };

  return (
    <button type="button" className={`back-button ${className}`.trim()} onClick={goBack} aria-label="이전 화면으로 이동">
      <span aria-hidden="true">{"<"}</span>
      {label}
    </button>
  );
}
