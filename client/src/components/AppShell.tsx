import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function AppShell({ children }: PropsWithChildren) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell" style={{display: 'flex', visibility: 'visible'}}>
      <header style={{display: 'flex', visibility: 'visible'}}>
        <div className="logo" style={{visibility: 'visible', color: '#f7f1e3'}}>HireReady Mock-Test</div>
        <nav style={{display: 'flex', visibility: 'visible'}}>
          <button
            className="toggle"
            type="button"
            onClick={toggleTheme}
            style={{visibility: 'visible'}}
          >
            {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
          <Link className="tag" to="/" style={{visibility: 'visible', textDecoration: 'none'}}>
            Home
          </Link>
          <Link className="tag" to="/history" style={{visibility: 'visible', textDecoration: 'none'}}>
            History
          </Link>
        </nav>
      </header>
      <div style={{visibility: 'visible'}}>
        {children}
      </div>
    </div>
  );
}
