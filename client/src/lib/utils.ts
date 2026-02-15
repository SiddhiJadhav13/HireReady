export function calcScore(correctCount: number) {
  return correctCount * 10;
}

export function calcPercentage(score: number, totalQuestions: number) {
  if (totalQuestions === 0) return 0;
  return Math.round((score / (totalQuestions * 10)) * 100);
}

export function calcSkillLevel(percentage: number) {
  if (percentage < 50) return "Beginner";
  if (percentage <= 75) return "Intermediate";
  return "Advanced";
}

export function formatDate(date: Date) {
  return date.toLocaleString();
}

export function findCodeBlock(text: string) {
  const match = text.match(/```([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}
