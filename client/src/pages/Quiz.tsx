import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import ProgressBar from "../components/ProgressBar";
import { fetchQuestions } from "../lib/api";
import { findCodeBlock } from "../lib/utils";
import { Question } from "../lib/types";
import { useAuth } from "../context/AuthContext";

const QUESTION_COUNT = 10;
const TIME_PER_QUESTION = 90;
const LETTERS = ["A", "B", "C", "D"];
const LABEL_RE = /^([A-D])[.)-]\s*/i;

function normalizeOption(option: string) {
  return option.replace(LABEL_RE, "").trim();
}

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(TIME_PER_QUESTION);

  const resolvedRole = user?.selectedRole || "";

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!resolvedRole) {
      setError("Please select a role before taking the quiz.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    fetchQuestions()
      .then((data) => {
        if (!mounted) return;
        const nextQuestions = data.slice(0, QUESTION_COUNT);
        if (nextQuestions.length === 0) {
          setError("No questions available for your selected role and skills.");
        }
        setQuestions(nextQuestions);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!mounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [resolvedRole, user, navigate]);

  useEffect(() => {
    if (!questions.length) return;
    setTimer(TIME_PER_QUESTION);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNext();
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, questions.length]);

  const current = questions[currentIndex];
  const progressValue = useMemo(() => ((currentIndex + 1) / QUESTION_COUNT) * 100, [currentIndex]);

  function handleSelect(letter: string) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: letter }));
  }

  function handleNext() {
    if (currentIndex < QUESTION_COUNT - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate("/result", {
        state: {
          role: resolvedRole,
          questions,
          answers
        }
      });
    }
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="card">
        <h2>Assessment</h2>
        <p>
          {resolvedRole || "Skill Quiz"} · {QUESTION_COUNT} Questions
        </p>
        <ProgressBar value={progressValue} />
      </div>

      {loading ? (
        <div className="card">Loading questions...</div>
      ) : error ? (
        <div className="card">{error}</div>
      ) : current ? (
        <div className="card question-card">
          <div className="tag">
            Q{currentIndex + 1} / {QUESTION_COUNT} · {timer}s
          </div>
          <h3>{current.question.replace(/```[\s\S]*?```/g, "")}</h3>
          {findCodeBlock(current.question) && (
            <pre className="code-block">{findCodeBlock(current.question)}</pre>
          )}
          <div className="options">
            {current.options.map((option, optionIndex) => {
              const letter = LETTERS[optionIndex] ?? "";
              const cleaned = normalizeOption(option);
              return (
              <button
                key={`${option}-${optionIndex}`}
                type="button"
                className={`option ${answers[currentIndex] === letter ? "selected" : ""}`}
                onClick={() => handleSelect(letter)}
              >
                  {letter ? `${letter}. ${cleaned}` : cleaned}
              </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
            <span className="tag">Time resets every question</span>
            <button className="button" type="button" onClick={handleNext}>
              {currentIndex === QUESTION_COUNT - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
