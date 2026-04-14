import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { getIssues } from "../services/issueService";

function LeaderboardPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIssues()
      .then(setIssues)
      .finally(() => setLoading(false));
  }, []);

  const leaders = useMemo(() => {
    const map = new Map();
    issues.forEach((issue) => {
      const user = issue.reportedBy;
      if (!user?._id) return;
      const item = map.get(user._id) || { name: user.name, score: 0, issues: 0 };
      item.score += issue.voteCount || 0;
      item.issues += 1;
      map.set(user._id, item);
    });
    return Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 20);
  }, [issues]);

  return (
    <AppShell>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-semibold">Leaderboard</h2>
        <p className="text-sm text-slate-600">Ranked by issue impact (total upvotes).</p>
        {loading && <p className="mt-3 text-sm text-slate-600">Loading leaderboard...</p>}
        <div className="mt-4 space-y-2">
          {!loading && leaders.length === 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No leaderboard entries yet.
            </div>
          )}
          {leaders.map((leader, index) => (
            <div key={`${leader.name}-${index}`} className="flex items-center justify-between rounded border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                <span className="w-7 rounded bg-slate-900 py-1 text-center text-xs text-white">#{index + 1}</span>
                <p className="font-medium">{leader.name}</p>
              </div>
              <p className="text-sm text-slate-600">
                {leader.score} votes • {leader.issues} issues
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default LeaderboardPage;
