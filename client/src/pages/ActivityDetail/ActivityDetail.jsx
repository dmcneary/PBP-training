import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState({});

  useEffect(() => {
    axios
      .get(`/api/activities/${id}`)
      .then((res) => {
        setActivity(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const handleDelete = (event) => {
    event.preventDefault();
    if (!activity._id) {
      return;
    }
    axios
      .delete(`/api/activities/${activity._id}`)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const durationMins = activity.durationMins ?? "--";
  const durationSecs = activity.durationSecs ?? "--";
  const distance = activity.distance ?? "--";
  const sportType = activity.sportType || "Activity";
  const athlete = activity.userId || "Unknown";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="tag">Activity detail</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {activity.actTitle || "Workout"}
          </h1>
          <p className="text-sm text-slate-400">
            {activity.actDate ? new Date(activity.actDate).toLocaleDateString() : "No date"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" type="button">
            Edit
          </button>
          <button className="btn-primary" onClick={handleDelete} type="button">
            Delete
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Summary
            </p>
            <p className="mt-3 text-sm text-slate-300">
              {activity.actDesc || "No notes added yet."}
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Athlete</p>
              <p className="text-white">{athlete}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sport</p>
              <p className="text-white">{sportType}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distance</p>
              <p className="text-white">{distance} mi</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
              <p className="text-white">
                {durationMins}m {durationSecs}s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
