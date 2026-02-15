import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import api from "../services/api";
import { calcPercentage, calcSkillLevel } from "../lib/utils";

type ResultRecord = {
  id: string;
  _id?: string;
  email: string;
  role: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
};

export default function History() {
  const [records, setRecords] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/quiz/results");

        if (!mounted) return;

        const results = (response.data?.results || []) as ResultRecord[];
        const normalized = results.map((record) => ({
          ...record,
          id: record.id || record._id || "",
        }));
        setRecords(normalized);
      } catch (err) {
        if (!mounted) return;
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        console.error("❌ Unexpected error loading results:", errorMsg);
        setRecords([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="card">
        <h2>Result History</h2>
        <p>Track your progress across roles and difficulty levels.</p>
      </div>

      {loading ? (
        <div className="card">⏳ Loading results...</div>
      ) : error ? (
        <div className="card" style={{ borderLeft: "4px solid var(--danger)" }}>
          <strong>⚠️ Could not load results</strong>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>{error}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card">📝 No attempts yet. Start a new assessment.</div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Email",
                  "Role",
                  "Score",
                  "Percentage",
                  "Skill Level",
                  "Date"
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td style={{ padding: "10px 8px" }}>{record.email}</td>
                  <td style={{ padding: "10px 8px" }}>{record.role}</td>
                  <td style={{ padding: "10px 8px" }}>
                    {record.score} / {record.totalQuestions * 10}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {calcPercentage(record.score, record.totalQuestions)}%
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {calcSkillLevel(calcPercentage(record.score, record.totalQuestions))}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
