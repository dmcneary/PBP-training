import { Link } from "react-router-dom";
import RecentActivities from "../../components/RecentActivities";

const Dashboard = (props) => {
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
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
