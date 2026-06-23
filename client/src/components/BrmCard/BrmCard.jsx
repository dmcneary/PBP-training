import { Link } from "react-router-dom";

const statusStyles = {
  planned: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  completed: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  missing: "border-amber-400/40 bg-amber-400/10 text-amber-200"
};

const formatDate = (dateValue) => {
  const rawValue = String(dateValue || "");
  if (!rawValue) return null;
  const dateOnly = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  }
  const parsed = Date.parse(rawValue);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const BrmCard = ({ id, distanceKm, distanceMiles, timeLimit, focus, window, description, status, match }) => {
  const badgeStyle = statusStyles[status] || statusStyles.missing;
  const statusLabel = status || "missing";
  const matchDate = formatDate(match?.date);

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
      {match ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Current match
          </p>
          <p className="mt-1 text-white">{match.sourceLabel}</p>
          {matchDate ? <p className="mt-1 text-xs text-slate-400">{matchDate}</p> : null}
        </div>
      ) : null}
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to={`/brm/${id}`} className="btn-ghost">
          View plan
        </Link>
        <Link to="/ride-calendar" className="btn-primary">
          Plan rides
        </Link>
      </div>
    </div>
  );
};

export default BrmCard;
