import { Link } from "react-router-dom";

const statusStyles = {
  planned: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  completed: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  missing: "border-amber-400/40 bg-amber-400/10 text-amber-200"
};

const BrmCard = ({ id, distanceKm, distanceMiles, timeLimit, focus, window, description, status }) => {
  const badgeStyle = statusStyles[status] || statusStyles.missing;
  const statusLabel = status || "missing";

  return (
    <div id={id} className="glass rounded-3xl border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">BRM {distanceKm}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {distanceKm} km / {distanceMiles} mi
          </h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${badgeStyle}`}>
          {statusLabel}
        </span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time limit</p>
          <p className="text-white">{timeLimit}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best window</p>
          <p className="text-white">{window}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus</p>
          <p className="text-white">{focus}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{description}</p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/brm-checklist" className="btn-ghost">
          View plan
        </Link>
        <button type="button" className="btn-primary">
          Log completion
        </button>
      </div>
    </div>
  );
};

export default BrmCard;
