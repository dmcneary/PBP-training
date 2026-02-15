import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = ({ loggedIn, getUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Logging in...");

    axios
      .post("/user/login", {
        username,
        password
      })
      .then((res) => {
        if (res.status === 200) {
          getUser();
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.log("login error: ");
        console.log(error);
        setMessage("Something went wrong...oops! Please try again later.");
      });
  };

  if (loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-6">
        <span className="tag">Welcome back</span>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Pick up where you left off.
        </h1>
        <p className="text-slate-300">
          Log in to view your performance snapshots, recent workouts, and progress
          across training blocks.
        </p>
        <div className="glass rounded-3xl p-6 text-sm text-slate-300">
          <p className="text-white">Need a fresh account?</p>
          <p className="mt-2">
            Get set up in seconds and start uploading workout files immediately.
          </p>
          <Link to="/signup" className="btn-ghost mt-4 inline-flex">
            Create an account
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
        <div>
          <label className="text-sm text-slate-300" htmlFor="username">
            Username
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            type="text"
            id="username"
            name="username"
            placeholder="your-handle"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            placeholder="••••••••"
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {message ? <p className="text-sm text-amber-200">{message}</p> : null}
        <button className="btn-primary w-full justify-center" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
