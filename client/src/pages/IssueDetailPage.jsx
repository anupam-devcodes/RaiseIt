import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { createComment, getIssueComments } from "../services/commentService";
import { getIssueById, upvoteIssue } from "../services/issueService";

function IssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const [issueData, commentData] = await Promise.all([getIssueById(id), getIssueComments(id)]);
      setIssue(issueData);
      setComments(commentData);
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

  if (!issue) return <AppShell>Loading issue...</AppShell>;

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-semibold">{issue.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {issue.category} • {issue.status}
          </p>
          <p className="mt-3 text-slate-700">{issue.description}</p>
          {issue.video && (
            <video className="mt-3 h-72 w-full rounded-lg object-cover" src={issue.video} autoPlay muted loop playsInline />
          )}
          {!issue.video && issue.photo && <img className="mt-3 h-72 w-full rounded-lg object-cover" src={issue.photo} alt={issue.title} />}
          <div className="mt-4 flex gap-3">
            <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleUpvote}>Upvote ({issue.voteCount})</button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Comments</h3>
          <div className="mb-3 flex gap-2">
            <input className="flex-1 rounded border px-3 py-2" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button className="rounded bg-slate-800 px-3 py-2 text-white disabled:opacity-60" onClick={() => handleComment()} disabled={busy}>Post</button>
          </div>
          <div className="space-y-2">
            {comments.length === 0 && (
              <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                No comments yet.
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment._id} className="rounded border border-slate-200 p-3">
                <p className="text-sm font-medium">{comment.author?.name || "User"}</p>
                <p className="text-sm text-slate-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default IssueDetailPage;
