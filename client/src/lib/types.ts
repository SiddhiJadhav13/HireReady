import { difficulties, RoleName } from "../data/roles";

export type Role = RoleName;
export type Difficulty = (typeof difficulties)[number];

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuizSession = {
  role: Role;
  difficulty: Difficulty;
  questions: Question[];
  answers: Record<number, string>;
};

export type ResultRecord = {
  id: string;
  role: Role;
  difficulty: Difficulty;
  score: number;
  percentage: number;
  skillLevel: string;
  date: string;
};
