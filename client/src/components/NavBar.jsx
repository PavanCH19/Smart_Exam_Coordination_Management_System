import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../redux/slices/authSlice";

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  // NOTE: there is no dedicated /auth/logout endpoint wired up yet.
  // Logging out only needs to clear local session state, so we do that
  // directly instead of calling an API that doesn't exist in this project.
  const signOut = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  const initials = (user?.name || user?.email || "U")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 font-display text-base font-semibold text-brass-300">
            E
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-tight text-ink-900 sm:inline">
            Smart Exam Coordination
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-100 font-mono text-xs font-semibold text-brass-700">
                  {initials}
                </span>
                <span className="text-sm text-ink-600">
                  {user?.name || user?.email}
                  <span className="ml-1.5 rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-500">
                    {user?.role || "User"}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-medium text-paper transition hover:bg-ink-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
