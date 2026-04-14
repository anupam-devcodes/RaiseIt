import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import SkeletonCard from "../components/SkeletonCard";
import { getCurrentUser } from "../services/authService";
import { getMyRewards } from "../services/rewardService";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await getCurrentUser();
      setUser(me?.user || null);
      setRewards(await getMyRewards());
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-3">
        {loading && (
          <>
            <SkeletonCard />
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
          </>
        )}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="mt-2 text-sm text-slate-600">{user?.name}</p>
          <p className="text-sm text-slate-600">{user?.email}</p>
          <p className="mt-2 rounded bg-slate-900 px-2 py-1 text-xs text-white inline-block">{user?.role}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold">Rewards & Badges</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {!loading && rewards.length === 0 && (
              <p className="text-sm text-slate-600">No rewards earned yet.</p>
            )}
            {rewards.map((reward) => (
              <div key={reward._id} className="rounded border border-slate-200 p-3">
                <p className="font-medium">{reward.type}</p>
                <p className="text-xs text-slate-500">{reward.reason || "No reason added"}</p>
                <p className="text-xs text-slate-600">+{reward.pointsAwarded} points</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ProfilePage;
