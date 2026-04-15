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
      <div className="space-y-5">
        <section className="surface-hero p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-(--accent)">Impact Rankings</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Leaderboard</h2>
          <p className="text-muted text-sm">Ranked by issue impact measured through total community upvotes.</p>
        </section>
      <div className="surface-card p-4 sm:p-5">
        {loading && <p className="text-muted mt-3 text-sm">Loading leaderboard...</p>}
        <div className="mt-4 space-y-2">
          {!loading && leaders.length === 0 && (
            <div className="surface-subtle p-3 text-sm">
              No leaderboard entries yet.
            </div>
          )}
          {leaders.map((leader, index) => (
            <div key={`${leader.name}-${index}`} className="surface-subtle flex items-center justify-between p-3 transition hover:border-(--accent)">
              <div className="flex items-center gap-3">
                <span className="w-7 rounded bg-(--accent) py-1 text-center text-xs text-white">#{index + 1}</span>
                <p className="font-medium">{leader.name}</p>
              </div>
              <p className="text-muted text-sm">
                {leader.score} votes • {leader.issues} issues
              </p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </AppShell>
  );
}

export default LeaderboardPage;
