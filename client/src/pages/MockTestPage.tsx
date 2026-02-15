import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ThemeToggle from "../components/ThemeToggle";
import "./MockTest.css";
import "../styles.css";

type QuestionType = {
  type: "mcq" | "snippet";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type UserAnswer = {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
};

export default function MockTestPage() {
  const navigate = useNavigate();
  
  const roleCategories = [
    {
      title: "Software Development",
      roles: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Java Developer",
        "Python Developer",
        "Web Developer",
        "Shopify Developer",
      ],
    },
    {
      title: "Data & AI",
      roles: [
        "Data Analyst",
        "Data Scientist",
        "Machine Learning Engineer",
        "AI Engineer",
      ],
    },
    {
      title: "Infrastructure & Cloud",
      roles: [
        "Database Administrator",
        "Cloud Engineer",
        "DevOps Engineer",
      ],
    },
    {
      title: "Security & Networks",
      roles: [
        "Cyber Security Engineer",
        "Network Engineer",
      ],
    },
    {
      title: "Mobile & Testing",
      roles: [
        "Mobile App Developer",
        "Android Developer",
        "iOS Developer",
        "Software Tester / QA",
        "System Engineer",
      ],
    },
  ];

  const difficulties = ["Low", "Medium", "High"] as const;

  // Setup state
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number] | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Test state
  const [testState, setTestState] = useState<"setup" | "testing" | "results">("setup");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const score = useMemo(() => userAnswers.filter(a => a.isCorrect).length, [userAnswers]);

  // Timer countdown effect
  useEffect(() => {
    if (testState !== "testing" || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  // Auto-advance when timer reaches 0
  useEffect(() => {
    if (testState === "testing" && timeLeft === 0) {
      // If no answer selected, record as incorrect
      if (!selectedAnswer) {
        setUserAnswers((prev) => [
          ...prev,
          { questionIndex: currentQuestionIndex, userAnswer: "", isCorrect: false },
        ]);
      }
      
      // Move to next question
      if (currentQuestionIndex === 9) {
        handleSubmit();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimeLeft(60);
        setSelectedAnswer("");
      }
    }
  }, [timeLeft, testState]);

  async function handleStart() {
    if (!role || !difficulty) {
      setError("Please select role and difficulty.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/quiz/generate", { role, difficulty });
      const data = response.data?.questions || [];
      
      if (data.length !== 10) {
        setError("Failed to generate full test. Please retry.");
        return;
      }
      
      setQuestions(data);
      setTestState("testing");
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setTimeLeft(60);
      setSelectedAnswer("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerSelect(answer: string) {
    // Allow changing answer before moving to next question
    setSelectedAnswer(answer);
  }

  function handleNext() {
    // Store the answer before moving to next
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setUserAnswers((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, userAnswer: selectedAnswer, isCorrect },
    ]);

    if (currentQuestionIndex === 9) {
      handleSubmit();
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(60);
    setSelectedAnswer("");
  }

  async function handleSubmit() {
    setTestState("results");
    setSubmitting(true);
    
    try {
      await api.post("/quiz/submit", {
        role,
        difficulty,
        score,
        totalQuestions: 10,
        answers: userAnswers,
      });
    } catch (err: any) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetest() {
    setTestState("setup");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimeLeft(60);
    setSelectedAnswer("");
    setRole("");
    setDifficulty("");
  }

  return (
    <div className="mock-root">
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <ThemeToggle />
      </div>
      {/* SETUP PHASE */}
      {testState === "setup" && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2>Mock Test</h2>
          <p style={{ marginTop: 8, opacity: 0.8 }}>Select your role and difficulty level to generate a personalized test</p>
          
          {/* Role Selection */}
          {roleCategories.map((category) => (
            <div key={category.title} style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, opacity: 0.9 }}>{category.title}</h3>
              <div className="role-grid">
                {category.roles.map((roleItem) => (
                  <button
                    key={roleItem}
                    type="button"
                    className={`role-card ${role === roleItem ? "selected" : ""}`}
                    onClick={() => setRole(roleItem)}
                  >
                    {roleItem}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Difficulty Selection */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, opacity: 0.9 }}>Difficulty Level</h3>
            <div className="difficulty-grid">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`difficulty-card ${difficulty === diff ? "selected" : ""}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Start Test Button */}
          <div style={{ marginTop: 24 }}>
            <button 
              className="button" 
              type="button" 
              onClick={handleStart} 
              disabled={loading || !role || !difficulty}
              style={{ opacity: (!role || !difficulty) ? 0.5 : 1 }}
            >
              {loading ? "Generating..." : "Start Test"}
            </button>
          </div>
          {error && <p style={{ color: "var(--danger)", marginTop: 12 }}>{error}</p>}
        </div>
      )}

      {/* TESTING PHASE */}
      {testState === "testing" && currentQuestion && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <span className="tag">Question {currentQuestionIndex + 1} / 10</span>
              {currentQuestion.type === "snippet" && (
                <span className="tag" style={{ marginLeft: 8, background: "var(--accent-2)" }}>Code Snippet</span>
              )}
            </div>
            <div className="timer" style={{
              fontSize: 24,
              fontWeight: "bold",
              color: timeLeft <= 10 ? "var(--danger)" : "var(--accent)",
              padding: "8px 16px",
              border: `2px solid ${timeLeft <= 10 ? "var(--danger)" : "var(--accent)"}`,
              borderRadius: 8,
            }}>
              {timeLeft}s
            </div>
          </div>

          <h3 style={{ marginBottom: 16, lineHeight: 1.5 }}>{currentQuestion.question}</h3>

          <div className="options-vertical">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              
              return (
                <button
                  key={idx}
                  type="button"
                  className={`option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <button 
              className="button" 
              onClick={handleNext}
              disabled={!selectedAnswer}
              style={{ opacity: !selectedAnswer ? 0.5 : 1 }}
            >
              {currentQuestionIndex === 9 ? "Submit Test" : "Next Question"}
            </button>
          </div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {testState === "results" && (
        <div>
          <div className="card" style={{ marginBottom: 24, textAlign: "center" }}>
            <h2>Test Complete!</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
              <div>
                <div style={{ fontSize: 48, fontWeight: "bold", color: "var(--accent)" }}>{score}/10</div>
                <div style={{ opacity: 0.8 }}>Total Score</div>
              </div>
              <div>
                <div style={{ fontSize: 48, fontWeight: "bold", color: "#4ade80" }}>{score}</div>
                <div style={{ opacity: 0.8 }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: 48, fontWeight: "bold", color: "#f87171" }}>{10 - score}</div>
                <div style={{ opacity: 0.8 }}>Wrong</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
              <button className="button" onClick={handleRetest}>
                Retake Test
              </button>
              <button 
                className="button" 
                onClick={() => navigate("/history")}
                style={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                View History
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 24 }}>Detailed Review</h3>
            {questions.map((q, index) => {
              const userAnswer = userAnswers.find(a => a.questionIndex === index);
              const isCorrect = userAnswer?.isCorrect || false;

              return (
                <div key={index} className="review-question" style={{
                  padding: 20,
                  marginBottom: 16,
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 12,
                  border: `2px solid ${isCorrect ? "#4ade80" : "#f87171"}`,
                }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <span className="tag">Question {index + 1}</span>
                    {q.type === "snippet" && (
                      <span className="tag" style={{ background: "var(--accent-2)" }}>Code Snippet</span>
                    )}
                    <span className={`tag ${isCorrect ? "correct-tag" : "incorrect-tag"}`}>
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>

                  <h4 style={{ marginBottom: 12, lineHeight: 1.5 }}>{q.question}</h4>

                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: isCorrect ? "#4ade80" : "#f87171" }}>Your Answer:</strong>{" "}
                    {userAnswer?.userAnswer || "Not answered"}
                  </div>

                  {!isCorrect && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: "#4ade80" }}>Correct Answer:</strong> {q.correctAnswer}
                    </div>
                  )}

                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 8,
                    borderLeft: "3px solid var(--accent)",
                  }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
