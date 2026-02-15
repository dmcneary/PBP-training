import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RecentUserActivities = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios
      .get("/api/activities")
      .then((res) => {
        setActivities(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  if (!activities.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
        No activities yet. Upload a workout to start building your dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link to={`/activities/${act._id}`} className="text-lg font-semibold text-white">
                {act.actTitle}
              </Link>
              <p className="text-xs text-slate-400">
                {act.actDate ? new Date(act.actDate).toLocaleDateString() : "No date"}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {act.sportType || "Activity"}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">{act.actDesc}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distance</p>
              <p className="text-white">{act.distance ?? "--"} mi</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
              <p className="text-white">
                {act.durationMins ?? "--"}m {act.durationSecs ?? "--"}s
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Athlete</p>
              <p className="text-white">{act.userId || "Unknown"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentUserActivities;
