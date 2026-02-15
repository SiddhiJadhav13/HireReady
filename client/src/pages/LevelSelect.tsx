import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { difficulties } from "../data/roles";
import { Role } from "../lib/types";

export default function LevelSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as { role?: Role })?.role;

  if (!role) {
    navigate("/roles", { replace: true });
    return null;
  }

  return (
    <AppShell>
      <div className="card">
        <h2>Select Difficulty</h2>
        <p>
          Role: <strong>{role}</strong>
        </p>
      </div>
      <div className="grid">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            className="card"
            type="button"
            onClick={() => navigate("/quiz", { state: { role, difficulty } })}
          >
            <div className="tag">{difficulty}</div>
            <h3>{difficulty} Assessment</h3>
            <p>
              {difficulty === "Low"
                ? "Conceptual MCQs only"
                : difficulty === "Medium"
                ? "MCQs + code snippets"
                : "Advanced + debugging + outputs"}
            </p>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
