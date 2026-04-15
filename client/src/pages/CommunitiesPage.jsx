import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { getCommunities, joinCommunity } from "../services/communityService";

function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getCommunities()
      .then(setCommunities)
      .catch((err) => showToast(err.message || "Failed to load communities", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    try {
      await joinCommunity(id, false);
      showToast("Joined community", "success");
      setCommunities(await getCommunities());
    } catch (err) {
      showToast(err.message || "Failed to join community", "error");
    }
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="surface-hero p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-(--accent)">Community Hub</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Communities</h2>
          <p className="text-muted mt-2 text-sm">
            Join discussion spaces that are automatically created for high-impact issues.
          </p>
        </section>

        {loading && <p className="text-muted text-sm">Loading communities...</p>}
        {!loading && communities.length === 0 && (
          <div className="surface-subtle p-4 text-sm">
            No communities yet. Communities auto-create at 4 upvotes.
          </div>
        )}
        {communities.map((community) => (
          <div key={community._id} className="surface-card p-4 transition hover:border-(--accent) sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold leading-tight">{community.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="chip">
                    {community.memberCount} members
                  </span>
                  <span className="rounded-full bg-(--accent-soft) px-2.5 py-1 text-xs font-semibold text-(--accent)">
                    {community.sourceIssue?.status || "Open"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary px-3 py-1.5 text-sm" onClick={() => handleJoin(community._id)}>Join</button>
                <Link className="btn-primary px-3 py-1.5 text-sm" to={`/communities/${community._id}/chat`}>Open Chat</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default CommunitiesPage;
