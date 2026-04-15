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
      <div className="surface-card mx-auto max-w-2xl p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-(--accent)">Report Center</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Report an Issue</h2>
          <p className="text-muted mt-1 text-sm">Share clear details so others can quickly validate and support this issue.</p>
        </div>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input className="form-control" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <textarea className="form-control" placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
          <select className="form-control" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {["WiFi", "Canteen", "Parking", "Library", "Hostel", "Sanitation", "Safety", "Other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="form-control" placeholder="Building" value={form.building} onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))} />
            <input className="form-control" placeholder="Zone" value={form.zone} onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))} />
          </div>
          <input className="form-control file:mr-3 file:rounded-md file:border-0 file:bg-(--accent-soft) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--accent)" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          <input className="form-control file:mr-3 file:rounded-md file:border-0 file:bg-(--accent-soft) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--accent)" type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
          <label className="text-muted flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))} />
            Post anonymously
          </label>
          <button className="btn-primary disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
        {message && <p className="text-muted mt-3 text-sm">{message}</p>}
      </div>
    </AppShell>
  );
}

export default ReportIssuePage;
