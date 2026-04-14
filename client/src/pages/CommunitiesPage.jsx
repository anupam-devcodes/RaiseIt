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
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Communities</h2>
        {loading && <p className="text-sm text-slate-600">Loading communities...</p>}
        {!loading && communities.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No communities yet. Communities auto-create at 50 upvotes.
          </div>
        )}
        {communities.map((community) => (
          <div key={community._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{community.name}</p>
                <p className="text-sm text-slate-600">
                  {community.memberCount} members • {community.sourceIssue?.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={() => handleJoin(community._id)}>Join</button>
                <Link className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white" to={`/communities/${community._id}/chat`}>Open Chat</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default CommunitiesPage;
