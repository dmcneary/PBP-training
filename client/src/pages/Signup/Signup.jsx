import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    gender: "",
    age: 13,
    location: "",
    message: ""
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("/user", {
        firstName: formState.firstName,
        lastName: formState.lastName,
        username: formState.username,
        password: formState.password,
        gender: formState.gender,
        age: formState.age,
        location: formState.location
      })
      .then((response) => {
        if (!response.data.errmsg) {
          navigate("/login");
        } else {
          setFormState((prevState) => ({
            ...prevState,
            message: "That username is already in use. Please pick a different username."
          }));
        }
      })
      .catch((error) => {
        const message =
          error?.response?.status === 409
            ? "That username is already in use. Please pick a different username."
            : "Something went wrong...oops! Please try again later.";
        setFormState((prevState) => ({
          ...prevState,
          message
        }));
      });
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <span className="tag">Create your profile</span>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Build your training HQ.
        </h1>
        <p className="text-slate-300">
          Upload workouts, analyze stats, and collect achievements as you sharpen
          your performance.
        </p>
        <div className="glass rounded-3xl p-6 text-sm text-slate-300">
          <p className="text-white">Already have an account?</p>
          <p className="mt-2">Jump back in to see your latest dashboard.</p>
          <Link to="/login" className="btn-ghost mt-4 inline-flex">
            Log in
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
        {formState.message ? (
          <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
            {formState.message}
          </p>
        ) : (
          <p className="text-sm text-slate-400">All fields are required.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-300">First name</label>
            <input
              value={formState.firstName}
              onChange={handleInputChange}
              name="firstName"
              placeholder="Taylor"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Last name</label>
            <input
              value={formState.lastName}
              onChange={handleInputChange}
              name="lastName"
              placeholder="Nguyen"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-300">Username</label>
          <input
            value={formState.username}
            onChange={handleInputChange}
            name="username"
            placeholder="taylorRuns"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input
            value={formState.password}
            onChange={handleInputChange}
            name="password"
            type="password"
            placeholder="••••••••"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm text-slate-300">Gender</label>
            <input
              value={formState.gender}
              onChange={handleInputChange}
              name="gender"
              placeholder="Optional"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Age</label>
            <input
              type="number"
              min="13"
              max="120"
              value={formState.age}
              onChange={handleInputChange}
              name="age"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Location</label>
            <input
              value={formState.location}
              onChange={handleInputChange}
              name="location"
              placeholder="Los Angeles"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            />
          </div>
        </div>
        <button className="btn-primary w-full justify-center" type="submit">
          Create account
        </button>
      </form>
    </div>
  );
};

export default Signup;
