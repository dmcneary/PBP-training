import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ getUser }) => {
  const navigate = useNavigate();

  const logout = (event) => {
    event.preventDefault();
    axios
      .post("/user/logout")
      .then((response) => {
        if (response.status === 200) {
          getUser();
          navigate("/");
        }
      })
      .catch((error) => {
        console.log("Logout error");
        console.log(error);
      });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/dashboard" className="text-lg font-semibold text-white">
          Fit Monkeys
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link to="/dashboard" className="btn-ghost">
            Dashboard
          </Link>
          <Link to="/challenges" className="btn-ghost">
            Challenges
          </Link>
          <Link to="/newactivity" className="btn-ghost">
            New activity
          </Link>
          <Link to="/all-activities" className="btn-ghost">
            All activities
          </Link>
          <button type="button" className="btn-primary" onClick={logout}>
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
