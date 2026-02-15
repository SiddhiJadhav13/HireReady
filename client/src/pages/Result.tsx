import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AnswerReview from "../components/AnswerReview";
import { calcPercentage, calcScore, calcSkillLevel } from "../lib/utils";
import { roles } from "../data/roles";
import { Question } from "../lib/types";
import api from "../services/api";

type LocationState = {
  role?: string;
  questions?: Question[];
  answers?: Record<number, string>;
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, questions, answers } = (location.state as LocationState) || {};
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!role || !questions || !answers) {
      navigate("/mocktest", { replace: true });
    }
  }, [role, questions, answers, navigate]);

  const scoreData = useMemo(() => {
    if (!questions) return null;
    const correctCount = questions.filter((q, index) => answers?.[index] === q.correctAnswer).length;
    const score = calcScore(correctCount);
    const percentage = calcPercentage(score, questions.length);
    const skillLevel = calcSkillLevel(percentage);
    return { correctCount, score, percentage, skillLevel };
  }, [questions, answers]);

  async function handleSave() {
    if (saved || isSaving) {
      return;
    }

    if (!role || !scoreData) {
      setSaveError("Missing quiz data - cannot save");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await api.post("/quiz/submit", {
        score: scoreData.score,
        totalQuestions: questions?.length ?? 0,
        answers
      });
      setSaved(true);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to save quiz result.";
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }

  if (!role || !questions || !answers || !scoreData) return null;

  const allowRetest = scoreData.percentage < 60;
  const roleMeta = roles.find((entry) => entry.roleName === role);

  return (
    <AppShell>
      <div className="card">
        <h2>Results</h2>
        <p>
          {role}{roleMeta ? ` · ${roleMeta.category}` : ""}
        </p>
        <div className="result-grid">
          <div className="card">
            <div className="tag">Score</div>
            <h3>{scoreData.score} / {questions.length * 10}</h3>
          </div>
          <div className="card">
            <div className="tag">Percentage</div>
            <h3>{scoreData.percentage}%</h3>
          </div>
          <div className="card">
            <div className="tag">Skill Level</div>
            <h3>{scoreData.skillLevel}</h3>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button className="button" type="button" onClick={() => navigate("/history")}>
            View History
          </button>
          {allowRetest && (
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                navigate("/mocktest", {
                  state: { excludeQuestions: questions.map((q) => q.question) }
                })
              }
            >
              Retest
            </button>
          )}
        </div>
      </div>

      <div className="card" style={saved ? { borderLeft: "4px solid var(--success)" } : {}}>
        <h3>
          {saved ? "✅ Result Saved" : "Save Result"}
        </h3>
        {saved ? (
          <div>
            <p style={{ color: "var(--success)", fontWeight: 500 }}>
              This quiz result has been saved. You can now retake the test or view your history.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <button className="button" type="button" onClick={() => navigate("/history")}>
                📊 View History
              </button>
              <button className="button secondary" type="button" onClick={() => navigate("/mocktest")}>
                🚀 Take Another Quiz
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>Save this attempt to your account history.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button
                className="button"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Result"}
              </button>
            </div>
            {saveError && (
              <p style={{ color: "var(--danger)", marginTop: 10, fontSize: "14px" }}>
                ⚠️ {saveError}
              </p>
            )}
          </>
        )}
      </div>

      <AnswerReview
        questions={questions}
        userAnswers={questions.map((_, index) => answers[index] ?? "")}
      />
    </AppShell>
  );
}
