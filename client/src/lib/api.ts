import { Question } from "./types";

export async function fetchQuestions() {
  const token = localStorage.getItem("hireready_token");
  const response = await fetch("/api/quiz/questions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch questions");
  }

  const data = (await response.json()) as { questions: Question[] };
  return data.questions;
}
