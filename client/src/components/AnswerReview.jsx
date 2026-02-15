import PropTypes from "prop-types";

const LETTERS = ["A", "B", "C", "D"];
const LABEL_RE = /^([A-D])[.)-]\s*/i;

function normalizeOption(option) {
  return option.replace(LABEL_RE, "").trim();
}

function resolveCorrectText(question) {
  const answer = question.correctAnswer;
  const index = LETTERS.indexOf(answer);
  if (index >= 0 && question.options[index]) {
    return `${answer}. ${normalizeOption(question.options[index])}`;
  }
  return answer;
}

export default function AnswerReview({ questions, userAnswers }) {
  const total = questions.length;
  const correctCount = questions.reduce((count, question, index) => {
    const userAnswer = userAnswers[index];
    return userAnswer === question.correctAnswer ? count + 1 : count;
  }, 0);
  const score = correctCount;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
  const skillLevel = percentage < 50 ? "Beginner" : percentage <= 75 ? "Intermediate" : "Advanced";

  return (
    <div className="card">
      <h3>Answer Review</h3>
      <div className="result-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="tag">Score</div>
          <h4>
            {score} / {total}
          </h4>
        </div>
        <div className="card">
          <div className="tag">Percentage</div>
          <h4>{percentage}%</h4>
        </div>
        <div className="card">
          <div className="tag">Skill Level</div>
          <h4>{skillLevel}</h4>
        </div>
      </div>
      {questions.map((question, index) => {
        const userAnswer = userAnswers[index] ?? "";
        const isCorrect = userAnswer === question.correctAnswer;
        const correctText = resolveCorrectText(question);

        return (
          <div key={`${question.question}-${index}`} className="card" style={{ marginTop: 16 }}>
            <div className="tag">Question {index + 1}</div>
            <p>{question.question.replace(/```[\s\S]*?```/g, "")}</p>
            <div className="options">
              {question.options.map((option, optionIndex) => {
                const letter = LETTERS[optionIndex];
                const cleaned = normalizeOption(option);
                const matchesUser = userAnswer === letter;
                const matchesCorrect = question.correctAnswer === letter;
                const status = matchesCorrect ? "correct" : matchesUser ? "wrong" : "";

                return (
                  <div key={`${option}-${optionIndex}`} className={`option ${status}`}>
                    {letter ? `${letter}. ${cleaned}` : cleaned}
                  </div>
                );
              })}
            </div>

            {isCorrect ? (
              <div style={{ marginTop: 12 }}>
                <div className="tag" style={{ background: "rgba(94, 227, 122, 0.2)", color: "#5ee37a" }}>
                  Correct
                </div>
                <p>{question.explanation}</p>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div className="tag" style={{ background: "rgba(246, 114, 128, 0.2)", color: "#f67280" }}>
                  Incorrect
                </div>
                <p>
                  Correct answer: <strong>{correctText}</strong>
                </p>
                <p>{question.explanation}</p>
                <p>
                  Improvement tip: revisit the underlying concept and practice similar scenarios to avoid this mistake.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

AnswerReview.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      correctAnswer: PropTypes.string.isRequired,
      explanation: PropTypes.string.isRequired
    })
  ).isRequired,
  userAnswers: PropTypes.arrayOf(PropTypes.string).isRequired
};
