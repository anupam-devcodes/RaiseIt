import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { getPublicDashboard } from "../services/dashboardService";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444"];

const StatCard = ({ title, value, hint }) => (
  <div className="surface-glass p-4 sm:p-5">
    <p className="text-muted text-xs font-medium uppercase tracking-wide">{title}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-(--text)">{value}</p>
    <p className="mt-1 text-xs text-(--text-soft)">{hint}</p>
  </div>
);

function PublicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const payload = await getPublicDashboard();
        setData(payload);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const mapCenter = useMemo(() => {
    const points = data?.map?.points || [];
    if (!points.length) return [28.6139, 77.209];
    const lat = points.reduce((sum, p) => sum + (p.location?.coords?.lat || 0), 0) / points.length;
    const lng = points.reduce((sum, p) => sum + (p.location?.coords?.lng || 0), 0) / points.length;
    return [lat, lng];
  }, [data]);

  if (loading) {
    return <div className="text-muted p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  const summary = data?.summary || { weekly: {}, monthly: {} };
  const charts = data?.charts || {
    monthlyTrend: [],
    categoryBreakdown: [],
    statusBreakdown: [],
  };
  const mapData = data?.map || { points: [], hotspots: [] };

  return (
    <div className="min-h-screen bg-(--background) px-6 py-8 text-(--text)">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="surface-hero p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--accent)">Analytics Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">RaiseIt Public Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-(--text-muted)">
            Live campus issue intelligence with trends, categories, and hotspot mapping.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">Live activity</span>
            <span className="chip">Crowd-sourced insights</span>
            <span className="chip">Campus heat zones</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Weekly Raised"
            value={summary.weekly.raised || 0}
            hint="Issues created this week"
          />
          <StatCard
            title="Weekly Resolved"
            value={summary.weekly.resolved || 0}
            hint="Issues resolved this week"
          />
          <StatCard
            title="Monthly Raised"
            value={summary.monthly.raised || 0}
            hint="Issues created this month"
          />
          <StatCard
            title="Monthly Resolved"
            value={summary.monthly.resolved || 0}
            hint="Issues resolved this month"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Issues Raised vs Resolved</h2>
            <p className="text-muted mt-1 text-sm">Monthly trend comparison</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="raised" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
            <p className="text-muted mt-1 text-sm">Distribution by issue type</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.categoryBreakdown} dataKey="value" nameKey="name" outerRadius={110}>
                    {charts.categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Status Distribution</h2>
            <p className="text-muted mt-1 text-sm">Issue states across the platform</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Hotspot Clusters</h2>
            <p className="text-muted mt-1 text-sm">Top dense locations by issue volume</p>
            <div className="space-y-3">
              {(mapData.hotspots || []).slice(0, 6).map((spot) => (
                <div
                  key={`${spot.lat}-${spot.lng}`}
                  className="surface-row flex items-center justify-between px-3 py-2"
                >
                  <span className="text-sm">
                    {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
                  </span>
                  <span className="rounded bg-(--accent) px-2 py-1 text-xs text-white">
                    {spot.count} issues
                  </span>
                </div>
              ))}
              {(!mapData.hotspots || mapData.hotspots.length === 0) && (
                <p className="text-muted text-sm">No dense hotspots yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Campus Map Heat & Hotspots</h2>
          <p className="text-muted mt-1 mb-3 text-sm">
            Geographic spread of reports and concentration areas.
          </p>
          <div className="h-[480px] overflow-hidden rounded-lg">
            <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapData.points.map((issue) => (
                <CircleMarker
                  key={issue._id}
                  center={[issue.location.coords.lat, issue.location.coords.lng]}
                  radius={Math.min(18, 6 + (issue.voteCount || 0) / 8)}
                  pathOptions={{
                    color: issue.status === "Resolved" ? "#64748b" : "#111827",
                    fillOpacity: 0.35,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{issue.title}</p>
                      <p>{issue.category}</p>
                      <p>Status: {issue.status}</p>
                      <p>Votes: {issue.voteCount}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {(mapData.hotspots || []).map((spot) => (
                <CircleMarker
                  key={`hot-${spot.lat}-${spot.lng}`}
                  center={[spot.lat, spot.lng]}
                  radius={Math.min(30, 10 + spot.count * 2)}
                  pathOptions={{ color: "#ef4444", fillOpacity: 0.15 }}
                >
                  <Popup>
                    <p className="text-sm font-semibold">{spot.count} nearby issues</p>
                    <p className="text-muted text-xs">Votes: {spot.totalVotes}</p>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicDashboard;
