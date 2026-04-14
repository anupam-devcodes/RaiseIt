import { lazy, Suspense, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { loginUser, registerUser } from "./services/authService";
import ChatRoomPage from "./pages/ChatRoomPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import HomeFeedPage from "./pages/HomeFeedPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
const PublicDashboard = lazy(() => import("./pages/PublicDashboard"));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-700">
    Loading page...
  </div>
);

const AuthLayout = ({ title, children }) => (
  <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="mb-5 text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  </div>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser(formData);
      setMessage(`Logged in as ${data.user.role}`);
    } catch (error) {
      setMessage(error.message || "Login failed");
    }
  };

  return (
    <AuthLayout title="RaiseIt - Login">
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, password: event.target.value }))
          }
          required
        />
        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-3 py-2 text-white"
        >
          Login
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
    </AuthLayout>
  );
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    role: "student",
  });
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await registerUser(formData);
      setMessage(`Registered as ${data.user.role}`);
    } catch (error) {
      setMessage(error.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="RaiseIt - Register">
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded border px-3 py-2"
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, name: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, password: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="text"
          placeholder="College"
          value={formData.college}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, college: event.target.value }))
          }
          required
        />
        <select
          className="w-full rounded border px-3 py-2"
          value={formData.role}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, role: event.target.value }))
          }
        >
          <option value="student">Student</option>
          <option value="authority">Authority</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-3 py-2 text-white"
        >
          Register
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
    </AuthLayout>
  );
};

const HomePage = () => <HomeFeedPage />;

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<HomeFeedPage />} />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route path="/dashboard/public" element={<PublicDashboard />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route
            path="/communities/:id/chat"
            element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
