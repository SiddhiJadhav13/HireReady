import { ResultRecord } from "./types";

const HISTORY_KEY = "ai_mock_test_history";
const SESSION_KEY = "ai_mock_test_session";

export function saveSession(data: string) {
  localStorage.setItem(SESSION_KEY, data);
}

export function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function saveResult(record: ResultRecord) {
  const history = getHistory();
  history.unshift(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory(): ResultRecord[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ResultRecord[];
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
