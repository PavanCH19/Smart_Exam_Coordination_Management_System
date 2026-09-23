import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const Unauthorized = () => (
  <div className="min-h-screen bg-paper">
    <NavBar />
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl text-rose-500">
        ⚠
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink-900">
        Unauthorized
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        You do not have permission to access this page. If you think this is
        a mistake, sign in with the correct account for your role.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink-800"
      >
        Back to home
      </Link>
    </main>
  </div>
);

export default Unauthorized;
