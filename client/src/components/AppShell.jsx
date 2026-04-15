import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem("raiseit_token"));
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("raiseit_token");
    navigate("/auth/login");
  };

  const handleLogoClick = () => {
    const onFeedRoute = location.pathname === "/" || location.pathname === "/feed";
    if (onFeedRoute) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 0);
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--text) transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b border-(--border) bg-[var(--background)/0.9] backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-(--background-elevated)"
            aria-label="Go to feed and scroll to top"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-(--border) bg-(--card) shadow-sm">
              <span className="absolute inset-0 bg-linear-to-br from-(--accent-soft) via-transparent to-(--accent-soft)" />
              <span className="relative text-sm font-extrabold tracking-tight text-(--accent)">
                Ri
              </span>
            </div>
            <h1 className="text-lg font-semibold tracking-[-0.01em] text-(--text) sm:text-xl">
              Raise<span className="text-(--accent)">It</span>
            </h1>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden items-center gap-1 rounded-2xl border border-(--border) bg-(--card) p-1 shadow-sm md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-(--accent) text-white shadow-sm"
                        : "text-(--text-muted) hover:bg-(--background-elevated) hover:text-(--text)"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--card) text-xl transition hover:border-(--accent) hover:shadow-[0_0_0_4px_var(--ring)]"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            
            {!hasToken ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/auth/login"
                  className="rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-sm font-medium text-(--text) transition hover:bg-(--background-elevated)"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="rounded-xl bg-(--accent) px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                >
                  Register
                </NavLink>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-sm font-medium text-(--text) transition hover:bg-(--background-elevated)"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 md:hidden lg:px-8">
          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-(--border) bg-(--card) p-1.5 shadow-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-(--accent) text-white"
                      : "text-(--text-muted) hover:bg-(--background-elevated) hover:text-(--text)"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

export default AppShell;
