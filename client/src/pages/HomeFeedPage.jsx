import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import SkeletonCard from "../components/SkeletonCard";
import { useToast } from "../components/ToastProvider";
import { getIssues } from "../services/issueService";

const PAGE_SIZE = 8;

function HomeFeedPage() {
  const [issues, setIssues] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIssues();
        setIssues(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load feed");
        showToast(err.message || "Failed to load feed", "error");
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(async () => {
      try {
        const latest = await getIssues();
        setIssues(latest);
      } catch {
        // Silent poll failure; next poll retries.
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, issues.length));
        }
      },
      { threshold: 0.2 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [issues.length]);

  const visibleIssues = useMemo(() => issues.slice(0, visibleCount), [issues, visibleCount]);

  return (
    <AppShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Campus Issue Feed</h2>
        {loading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
        {!loading && error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {!loading && !error && issues.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No issues yet. Be the first to report one.
          </div>
        )}
        {visibleIssues.map((issue) => (
          <Link
            key={issue._id}
            to={`/issues/${issue._id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">{issue.title}</p>
              <span className="rounded bg-slate-900 px-2 py-1 text-xs text-white">
                {issue.voteCount} votes
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{issue.category}</p>
            <p className="mt-2 text-sm text-slate-700 line-clamp-2">{issue.description}</p>
            {issue.video && (
              <video
                className="mt-3 h-56 w-full rounded-lg object-cover"
                src={issue.video}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            {!issue.video && issue.photo && (
              <img className="mt-3 h-56 w-full rounded-lg object-cover" src={issue.photo} alt={issue.title} />
            )}
          </Link>
        ))}
        <div ref={loaderRef} className="py-4 text-center text-sm text-slate-500">
          {visibleCount >= issues.length ? "End of feed" : "Loading more..."}
        </div>
      </div>

      <Link
        to="/report"
        className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-5 py-3 text-2xl text-white shadow-lg"
      >
        +
      </Link>
    </AppShell>
  );
}

export default HomeFeedPage;
