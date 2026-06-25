import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import RecentActivities from "../../components/RecentActivities";

const Dashboard = (props) => {
  const [formState, setFormState] = useState({
    apiKey: "",
    authToken: "",
    limit: 20
  });
  const [importState, setImportState] = useState({
    status: "idle",
    message: "",
    summary: null
  });

  const handleImportFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "limit" ? Number(value) || 1 : value
    }));
  };

  const handleImport = (event) => {
    event.preventDefault();
    setImportState({ status: "loading", message: "", summary: null });

    axios
      .post("/api/rwgps/import", {
        apiKey: formState.apiKey.trim() || undefined,
        authToken: formState.authToken.trim() || undefined,
        limit: formState.limit
      })
      .then((response) => {
        setImportState({
          status: "success",
          message: "Import complete.",
          summary: response.data
        });
      })
      .catch((error) => {
        const message =
          error?.response?.data?.details ||
          error?.response?.data?.error ||
          "Import failed.";
        setImportState({
          status: "error",
          message,
          summary: null
        });
      });
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="tag">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Welcome back, {props.username || "athlete"}.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/newactivity" className="btn-primary">
            Upload workout
          </Link>
          <Link to="/all-activities" className="btn-ghost">
            View all
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent activity</h2>
            <span className="text-xs text-slate-400">Last 7 days</span>
          </div>
          <div className="mt-6">
            <RecentActivities username={props.username} />
          </div>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white">Performance tiles</h2>
          <p className="mt-2 text-sm text-slate-300">
            Your key stats will appear here once workouts land.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              { label: "Avg pace", value: "7:42 /mi" },
              { label: "HR range", value: "128-162 bpm" },
              { label: "Power", value: "215w avg" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Ride with GPS import
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Paste your Ride with GPS API key + auth token to import your most recent rides.
            </p>
            <form className="mt-4 grid gap-3" onSubmit={handleImport}>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
                type="password"
                name="apiKey"
                value={formState.apiKey}
                onChange={handleImportFieldChange}
                placeholder="RWGPS API key (optional if server env is set)"
                autoComplete="off"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
                type="password"
                name="authToken"
                value={formState.authToken}
                onChange={handleImportFieldChange}
                placeholder="RWGPS auth token (optional if server env is set)"
                autoComplete="off"
              />
              <div className="flex items-center gap-3">
                <input
                  className="w-24 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-emerald-300 focus:outline-none"
                  type="number"
                  min="1"
                  max="100"
                  name="limit"
                  value={formState.limit}
                  onChange={handleImportFieldChange}
                />
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={importState.status === "loading"}
                >
                  {importState.status === "loading" ? "Importing..." : "Import rides"}
                </button>
              </div>
            </form>
            {importState.message ? (
              <p
                className={`mt-3 text-xs ${
                  importState.status === "error" ? "text-amber-300" : "text-emerald-200"
                }`}
              >
                {importState.message}
              </p>
            ) : null}
            {importState.summary ? (
              <p className="mt-2 text-xs text-slate-400">
                Fetched {importState.summary.fetched}, imported {importState.summary.importedCount},
                skipped {importState.summary.skippedCount}.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
