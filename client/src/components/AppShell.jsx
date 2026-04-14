import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { to: "/", label: "Feed" },
  { to: "/report", label: "Report" },
  { to: "/dashboard/public", label: "Dashboard" },
  { to: "/communities", label: "Communities" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
];

function AppShell({ children }) {
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem("raiseit_token"));
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("raiseit_token");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">RaiseIt</h1>
          <div className="flex items-center gap-3">
            <nav className="hidden gap-2 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded px-3 py-1.5 text-sm ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full p-1.5 text-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            
            {!hasToken ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/auth/login"
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
                >
                  Register
                </NavLink>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export default AppShell;
