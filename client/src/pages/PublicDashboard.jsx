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

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#1e293b"];

const StatCard = ({ title, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
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
    return <div className="p-8 text-slate-600">Loading dashboard...</div>;
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
    <div className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-linear-to-r from-slate-900 to-slate-700 p-6 text-white shadow">
          <h1 className="text-3xl font-semibold">RaiseIt Public Dashboard</h1>
          <p className="mt-2 text-sm text-slate-100">
            Live campus issue intelligence with trends, categories, and hotspot mapping.
          </p>
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
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Issues Raised vs Resolved</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="raised" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" fill="#64748b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Category Breakdown</h2>
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
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Status Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Hotspot Clusters</h2>
            <div className="space-y-3">
              {(mapData.hotspots || []).slice(0, 6).map((spot) => (
                <div
                  key={`${spot.lat}-${spot.lng}`}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">
                    {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
                  </span>
                  <span className="rounded bg-slate-900 px-2 py-1 text-xs text-white">
                    {spot.count} issues
                  </span>
                </div>
              ))}
              {(!mapData.hotspots || mapData.hotspots.length === 0) && (
                <p className="text-sm text-slate-500">No dense hotspots yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Campus Map Heat & Hotspots</h2>
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
                    <p className="text-xs text-slate-600">Votes: {spot.totalVotes}</p>
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
