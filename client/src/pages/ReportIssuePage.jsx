import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { createIssue } from "../services/issueService";

function ReportIssuePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    building: "",
    zone: "",
    isAnonymous: false,
  });
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const issue = await createIssue({ ...form, photo, video });
      setMessage("Issue reported successfully");
      showToast("Issue reported successfully", "success");
      setTimeout(() => navigate(`/issues/${issue._id}`), 600);
    } catch (error) {
      setMessage(error.message || "Failed to report issue");
      showToast(error.message || "Failed to report issue", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Report an Issue</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input className="w-full rounded border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <textarea className="w-full rounded border px-3 py-2" placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
          <select className="w-full rounded border px-3 py-2" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {["WiFi", "Canteen", "Parking", "Library", "Hostel", "Sanitation", "Safety", "Other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="w-full rounded border px-3 py-2" placeholder="Building" value={form.building} onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))} />
            <input className="w-full rounded border px-3 py-2" placeholder="Zone" value={form.zone} onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))} />
          </div>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))} />
            Post anonymously
          </label>
          <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </AppShell>
  );
}

export default ReportIssuePage;
