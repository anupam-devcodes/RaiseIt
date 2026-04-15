import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { createComment, getIssueComments } from "../services/commentService";
import { getIssueById, upvoteIssue, deleteIssue } from "../services/issueService";
import { getCurrentUser } from "../services/authService";

function IssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const [issueData, commentData, currentUserData] = await Promise.all([
        getIssueById(id),
        getIssueComments(id),
        getCurrentUser(),
      ]);
      setIssue(issueData);
      setComments(commentData);
      setViewer(currentUserData?.user || null);
    };
    load();
  }, [id]);

  const handleUpvote = async () => {
    try {
      const updated = await upvoteIssue(id);
      setIssue(updated);
      showToast("Upvoted successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to upvote", "error");
    }
  };

  const handleComment = async (replyTo = null) => {
    if (!commentText.trim()) return;
    setBusy(true);
    try {
      await createComment({ issueId: id, content: commentText, replyTo });
      setCommentText("");
      setComments(await getIssueComments(id));
      showToast("Comment posted", "success");
    } catch (err) {
      showToast(err.message || "Failed to post comment", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue?._id || deleting) return;
    const confirmed = window.confirm("Delete this issue permanently?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteIssue(issue._id);
      showToast("Issue deleted", "success");
      navigate("/", { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to delete issue", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (!issue) return <AppShell>Loading issue...</AppShell>;
  const isOwner = viewer?._id && issue?.reportedBy?._id && viewer._id === issue.reportedBy._id;
  const canDelete = Boolean(isOwner || viewer?.role === "admin");

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="surface-card p-4 shadow-sm">
          <h2 className="text-2xl font-semibold">{issue.title}</h2>
          <p className="text-muted mt-1 text-sm">
            {issue.category} • {issue.status}
          </p>
          <p className="mt-3">{issue.description}</p>
          {issue.video && (
            <video className="mt-3 h-72 w-full rounded-lg object-cover" src={issue.video} autoPlay muted loop playsInline />
          )}
          {!issue.video && issue.photo && <img className="mt-3 h-72 w-full rounded-lg object-cover" src={issue.photo} alt={issue.title} />}
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={handleUpvote}>Upvote ({issue.voteCount})</button>
            {canDelete && (
              <button
                className="btn-secondary border-rose-400 text-rose-600 hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
                onClick={handleDeleteIssue}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Issue"}
              </button>
            )}
          </div>
        </div>

        <div className="surface-card p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Comments</h3>
          <div className="mb-3 flex gap-2">
            <input className="form-control flex-1" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button className="btn-primary px-3 py-2 disabled:opacity-60" onClick={() => handleComment()} disabled={busy}>Post</button>
          </div>
          <div className="space-y-2">
            {comments.length === 0 && (
              <p className="surface-subtle p-3 text-sm">
                No comments yet.
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment._id} className="surface-subtle p-3">
                <p className="text-sm font-medium">{comment.author?.name || "User"}</p>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default IssueDetailPage;
