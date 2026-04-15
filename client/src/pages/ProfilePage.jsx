import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import SkeletonCard from "../components/SkeletonCard";
import { getCurrentUser } from "../services/authService";
import { getMyRewards } from "../services/rewardService";
import { deleteIssue, getIssues } from "../services/issueService";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [reportedIssues, setReportedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await getCurrentUser();
      const currentUser = me?.user || null;
      setUser(currentUser);

      const [rewardData, allIssues] = await Promise.all([getMyRewards(), getIssues()]);
      setRewards(rewardData);
      setReportedIssues(
        allIssues.filter((issue) => issue?.reportedBy?._id && issue.reportedBy._id === currentUser?._id),
      );
      setLoading(false);
    };
    load();
  }, []);

  const handleDeleteIssue = async (issueId) => {
    const confirmed = window.confirm("Delete this reported issue permanently?");
    if (!confirmed) return;
    try {
      await deleteIssue(issueId);
      setReportedIssues((prev) => prev.filter((issue) => issue._id !== issueId));
    } catch {
      // Toast provider not used on this page; keep interaction minimal.
    }
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="surface-hero p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-(--accent)">Account</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your Profile</h2>
          <p className="text-muted mt-2 text-sm">
            Manage your identity and track your contribution rewards.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
        {loading && (
          <>
            <SkeletonCard />
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
          </>
        )}
          <div className="surface-card p-4 lg:col-span-1 sm:p-5">
            <h3 className="text-lg font-semibold">Profile Details</h3>
            <div className="mt-4 space-y-3">
              <div className="surface-subtle px-3 py-2">
                <p className="text-muted text-[11px] uppercase tracking-wide">Name</p>
                <p className="mt-0.5 text-sm font-medium">{user?.name || "—"}</p>
              </div>
              <div className="surface-subtle px-3 py-2">
                <p className="text-muted text-[11px] uppercase tracking-wide">Email</p>
                <p className="mt-0.5 text-sm font-medium break-all">{user?.email || "—"}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-(--border) bg-(--background-elevated) px-3 py-2">
                <p className="text-muted text-[11px] uppercase tracking-wide">Role</p>
                <span className="rounded-full bg-(--accent-soft) px-2.5 py-1 text-xs font-semibold text-(--accent)">
                  {user?.role || "user"}
                </span>
              </div>
            </div>
          </div>

          <div className="surface-card p-4 lg:col-span-2 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Rewards & Badges</h3>
                <p className="text-muted mt-1 text-sm">
                  Recognition for your positive impact and civic participation.
                </p>
              </div>
              <span className="rounded-full border border-(--border) bg-(--background-elevated) px-2.5 py-1 text-xs font-medium">
                {rewards.length} total
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {!loading && rewards.length === 0 && (
                <div className="surface-subtle col-span-full p-4 text-sm">
                  No rewards earned yet. Keep reporting and supporting issues to build impact.
                </div>
              )}
              {rewards.map((reward) => (
                <div key={reward._id} className="surface-subtle p-3 transition hover:border-(--accent)">
                  <p className="font-medium">{reward.type}</p>
                  <p className="text-muted mt-1 text-xs">{reward.reason || "No reason added"}</p>
                  <p className="text-muted mt-2 text-xs">+{reward.pointsAwarded} points</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="surface-card p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Reported Issues</h3>
              <p className="text-muted mt-1 text-sm">
                Issues you have submitted across the platform.
              </p>
            </div>
            <span className="rounded-full border border-(--border) bg-(--background-elevated) px-2.5 py-1 text-xs font-medium">
              {reportedIssues.length} total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {!loading && reportedIssues.length === 0 && (
              <div className="surface-subtle p-4 text-sm">
                You have not reported any issues yet.
              </div>
            )}

            {reportedIssues.map((issue) => (
              <div key={issue._id} className="issue-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{issue.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="chip">{issue.category}</span>
                      <span className="chip">{issue.status}</span>
                      <span className="chip">{issue.voteCount} votes</span>
                    </div>
                    <p className="text-muted mt-1 text-xs">
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <button
                    className="btn-secondary border-rose-400 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    onClick={() => handleDeleteIssue(issue._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default ProfilePage;
