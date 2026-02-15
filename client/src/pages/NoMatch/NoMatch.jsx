import { Link } from "react-router-dom";

const NoMatch = () => (
  <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
    <span className="tag">404</span>
    <h1 className="text-3xl font-semibold text-white">Off route</h1>
    <p className="text-slate-300">
      The page you’re looking for doesn’t exist. Head back to the dashboard or
      explore challenges.
    </p>
    <Link to="/dashboard" className="btn-primary">
      Back to dashboard
    </Link>
  </div>
);

export default NoMatch;
