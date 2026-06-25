import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-white">
          PBP Planner
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/" className="btn-ghost">
            Home
          </Link>
          <Link to="/login" className="btn-ghost">
            Login
          </Link>
          <Link to="/signup" className="btn-primary">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
