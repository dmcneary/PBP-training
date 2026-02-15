import { Link } from "react-router-dom";

function ChallengeCard(props) {
  const bananas = Math.min(Number(props.bananas || 0), 6);

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <img
        alt={props.name}
        src={props.image}
        className="h-44 w-full object-cover"
      />
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{props.name}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            {props.distance}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">{props.location}</p>
        <p className="mt-3 text-sm text-slate-300">
          {props.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs text-amber-200">
            {Array.from({ length: bananas }).map((_, index) => (
              <span key={`${props.id}-banana-${index}`}>🍌</span>
            ))}
          </div>
          <Link
            to="/ChallengeSignUp"
            state={{ name: props.name, img: props.image }}
            className="btn-primary"
          >
            Join now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ChallengeCard;
