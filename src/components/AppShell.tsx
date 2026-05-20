import type { ReactNode } from "react";

import BackButton from "./BackButton";
import WindowControls from "./WindowControls";

type AppShellProps = {
  step?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  showBack?: boolean;
  backFallbackTo?: string;
};

export default function AppShell({ step, title, subtitle, children, footer, className = "", showBack = true, backFallbackTo }: AppShellProps) {
  return (
    <main className={`mirror-shell ${className}`}>
      {/* TEMP_UI_BUTTON_START */}
      <button
        type="button"
        className="temp-quick-button"
        onClick={() => window.alert("임시 버튼 동작")}
      >
        임시 버튼
      </button>
      {/* TEMP_UI_BUTTON_END */}
      {showBack ? <BackButton fallbackTo={backFallbackTo} /> : null}
      <WindowControls />
      <header className="mirror-shell__header">
        <div>
          {step ? <span className="eyebrow">{step}</span> : null}
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </header>
      <section className="mirror-shell__body">{children}</section>
      {footer ? <footer className="mirror-shell__footer">{footer}</footer> : null}
    </main>
  );
}
