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
  const [previewMedia, setPreviewMedia] = useState(null);
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
      <div className="mx-auto w-full max-w-4xl space-y-8 sm:space-y-10">
        <section className="surface-hero px-5 py-6 sm:px-7 sm:py-8">
          <p className="text-sm font-medium uppercase tracking-wide text-(--accent)">
            Civic Feed
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Campus Issue Feed</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--text-muted) sm:text-base">
            Track reported campus issues, support meaningful updates, and help prioritize what
            needs attention first.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip">Live reports</span>
            <span className="chip">Media evidence</span>
            <span className="chip">Community votes</span>
          </div>
        </section>

        {loading && (
          <div className="space-y-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}
        {!loading && !error && issues.length === 0 && (
          <div className="rounded-xl border border-(--border) bg-(--card) p-6 text-sm text-(--text-muted)">
            No issues yet. Be the first to report one.
          </div>
        )}

        <div className="space-y-5 sm:space-y-6">
          {visibleIssues.map((issue) => (
            <Link
              key={issue._id}
              to={`/issues/${issue._id}`}
              className="issue-card group block overflow-hidden p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="text-[1.05rem] font-semibold leading-snug text-(--text) transition group-hover:text-(--accent)">
                    {issue.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="chip">{issue.category}</span>
                    <span className="chip">{issue.status}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-(--accent-soft) px-2 py-0.5 text-xs font-semibold text-(--accent)">
                  {issue.voteCount} votes
                </span>
              </div>

              <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-(--text-muted)">
                {issue.description}
              </p>

              {issue.video && (
                <button
                  type="button"
                  className="mt-3 block w-full overflow-hidden rounded-xl border border-(--border) bg-black/80 transition hover:border-(--accent)"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPreviewMedia({ type: "video", src: issue.video, title: issue.title });
                  }}
                  aria-label={`Preview video for ${issue.title}`}
                >
                  <div className="relative aspect-video w-full">
                    <video
                      className="h-full w-full object-contain"
                      src={issue.video}
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  </div>
                </button>
              )}
              {!issue.video && issue.photo && (
                <button
                  type="button"
                  className="mt-3 block w-full overflow-hidden rounded-xl border border-(--border) bg-black/70 transition hover:border-(--accent)"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPreviewMedia({ type: "image", src: issue.photo, title: issue.title });
                  }}
                  aria-label={`Preview image for ${issue.title}`}
                >
                  <div className="relative aspect-16/10 w-full sm:aspect-video">
                    <img className="h-full w-full object-contain" src={issue.photo} alt={issue.title} />
                  </div>
                </button>
              )}
            </Link>
          ))}
        </div>

        <div ref={loaderRef} className="pt-2 pb-4 text-center text-sm text-(--text-muted)">
          {visibleCount >= issues.length ? "End of feed" : "Loading more..."}
        </div>
      </div>

      <Link
        to="/report"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-(--accent) bg-(--accent) px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-(--ring)"
        aria-label="Report an issue"
      >
        <span className="text-lg leading-none">+</span>
        <span>Report issue</span>
      </Link>

      {previewMedia && (
        <button
          type="button"
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewMedia(null)}
          aria-label="Close media preview"
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-(--border) bg-black/90"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
              <p className="truncate text-sm font-medium">{previewMedia.title}</p>
              <span className="text-xs uppercase tracking-wide text-slate-300">Close</span>
            </div>
            <div className="max-h-[78vh] overflow-auto p-3">
              {previewMedia.type === "video" ? (
                <video
                  className="mx-auto max-h-[72vh] w-full rounded-lg object-contain"
                  src={previewMedia.src}
                  controls
                  autoPlay
                />
              ) : (
                <img
                  className="mx-auto max-h-[72vh] w-full rounded-lg object-contain"
                  src={previewMedia.src}
                  alt={previewMedia.title}
                />
              )}
            </div>
          </div>
        </button>
      )}
    </AppShell>
  );
}

export default HomeFeedPage;
