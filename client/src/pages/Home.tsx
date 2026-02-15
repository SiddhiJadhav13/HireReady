import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div className="card">
        <h1>AI Mock Test & Skill Assessment</h1>
        <p>
          Pick a professional role and difficulty level to generate a fresh,
          interview-grade assessment tailored to higher-level students.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <Link className="button" to="/roles">
            Start Assessment
          </Link>
          <Link className="button secondary" to="/history">
            View History
          </Link>
        </div>
      </div>
      <div className="grid">
        {[
          "Dynamic GROQ LLM question generation",
          "Adaptive feedback with AI explanations",
          "Role + difficulty aligned scoring",
          "Retest with fresh questions"
        ].map((item) => (
          <div className="card" key={item}>
            <div className="tag">Feature</div>
            <h3>{item}</h3>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
