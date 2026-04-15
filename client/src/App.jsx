import { lazy, Suspense, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
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
  <div className="min-h-screen bg-(--background) px-6 py-10 text-(--text-muted)">
    Loading page...
  </div>
);

const authInputClass =
  "w-full rounded-xl border border-(--border) bg-(--background-elevated) px-4 py-3 text-sm text-(--text) placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition focus:border-(--accent) focus:bg-(--card) focus:outline-none focus:ring-4 focus:ring-(--ring)";

const authButtonClass =
  "w-full rounded-xl bg-(--accent) px-4 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] text-white shadow-[0_14px_32px_-14px_var(--accent)] transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-(--ring)";

const authSelectClass = `${authInputClass} appearance-none`;

const authLabelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.11em] text-(--text-muted)";
const authHelperLinkClass = "font-medium text-(--accent) transition hover:underline";

const AuthField = ({ label, children }) => (
  <label className="block">
    <span className={authLabelClass}>{label}</span>
    {children}
  </label>
);

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-(--background) px-4 py-8 text-(--text) sm:px-6 sm:py-14">
    <section className="mx-auto w-full max-w-md rounded-3xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-7">
      <div className="mb-8 text-center sm:mb-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">RaiseIt</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[2rem]">{title}</h2>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-(--text-muted)">{subtitle}</p>
      </div>

      <div className="mb-7 rounded-2xl border border-(--border) bg-(--background-elevated) p-1">
        <div className="grid grid-cols-2 gap-1">
          <NavLink
            to="/auth/login"
            className={({ isActive }) =>
              `rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
                isActive
                  ? "bg-(--accent) text-white shadow-[0_8px_20px_-10px_var(--accent)]"
                  : "text-(--text-muted) hover:bg-(--card) hover:text-(--text)"
              }`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/auth/register"
            className={({ isActive }) =>
              `rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
                isActive
                  ? "bg-(--accent) text-white shadow-[0_8px_20px_-10px_var(--accent)]"
                  : "text-(--text-muted) hover:bg-(--card) hover:text-(--text)"
              }`
            }
          >
            Register
          </NavLink>
        </div>
      </div>

      {children}

      <p className="mt-8 text-center text-[11px] leading-relaxed text-(--text-muted)">
        By continuing, you agree to RaiseIt's terms and privacy policy.
      </p>
    </section>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser(formData);
      setMessage(`Logged in as ${data.user.role}`);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(error.message || "Login failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to continue collaborating on campus issues."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthField label="Email address">
          <input
            className={authInputClass}
            type="email"
            placeholder="you@college.edu"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </AuthField>
        <AuthField label="Password">
          <input
            className={authInputClass}
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
        </AuthField>
        <p className="pt-0.5 text-xs text-(--text-muted)">
          Use the same account you created for your campus community.
        </p>
        <button
          type="submit"
          className={authButtonClass}
        >
          Sign in to RaiseIt
        </button>
        <p className="pt-1 text-center text-xs text-(--text-muted)">
          New to RaiseIt?{" "}
          <NavLink to="/auth/register" className={authHelperLinkClass}>
            Create an account
          </NavLink>
        </p>
      </form>
      {message && <p className="mt-4 text-sm text-(--text-muted)">{message}</p>}
    </AuthLayout>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
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
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(error.message || "Registration failed");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register to report issues and help improve your campus."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthField label="Full name">
          <input
            className={authInputClass}
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
        </AuthField>
        <AuthField label="Email address">
          <input
            className={authInputClass}
            type="email"
            placeholder="you@college.edu"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </AuthField>
        <AuthField label="Password">
          <input
            className={authInputClass}
            type="password"
            placeholder="Create a secure password"
            value={formData.password}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
        </AuthField>
        <AuthField label="College">
          <input
            className={authInputClass}
            type="text"
            placeholder="Your institution"
            value={formData.college}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, college: event.target.value }))
            }
            required
          />
        </AuthField>
        <AuthField label="Role">
          <select
            className={authSelectClass}
            value={formData.role}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, role: event.target.value }))
            }
          >
            <option value="student">Student</option>
            <option value="authority">Authority</option>
            <option value="admin">Admin</option>
          </select>
        </AuthField>
        <p className="pt-0.5 text-xs text-(--text-muted)">
          Create an account with your real profile details for better community trust.
        </p>
        <button
          type="submit"
          className={authButtonClass}
        >
          Create RaiseIt account
        </button>
        <p className="pt-1 text-center text-xs text-(--text-muted)">
          Already have an account?{" "}
          <NavLink to="/auth/login" className={authHelperLinkClass}>
            Sign in
          </NavLink>
        </p>
      </form>
      {message && <p className="mt-4 text-sm text-(--text-muted)">{message}</p>}
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
