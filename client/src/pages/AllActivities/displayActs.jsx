import { useEffect, useState } from "react";
import axios from "axios";

const AllActivities = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios
      .get("/api/all-activities")
      .then((res) => {
        setActivities(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="tag">Activity feed</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">All activities</h1>
        <p className="mt-2 text-slate-300">
          A community stream of workouts from everyone on the platform.
        </p>
      </div>
      {activities.length ? (
        <div className="grid gap-4">
          {activities.map((act) => (
            <div key={act._id} className="glass rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-lg font-semibold text-white">
                    {act.actTitle}
                  </span>
                  <p className="text-xs text-slate-400">
                    {act.actDate ? new Date(act.actDate).toLocaleDateString() : "No date"}
                  </p>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {act.sportType || "Activity"}
                </div>
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
      ) : (
        <div className="glass rounded-3xl p-6 text-sm text-slate-300">
          No results to display yet.
        </div>
      )}
    </div>
  );
};

export default AllActivities;
