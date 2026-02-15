import { Link, useParams } from "react-router-dom";
import brmData from "../../utils/brm.json";
import ChallengeForm from "../../components/ChallengeForm";

const BrmPlan = () => {
  const { id } = useParams();
  const fallback = brmData[0];
  const brevet = brmData.find((item) => item.id === id) || fallback;
  const { distanceKm, distanceMiles, timeLimit, focus, window, description } = brevet;

  const planChecklist = [
    `Complete a ${Math.round(distanceKm * 0.7)} km long ride with steady pacing.`,
    `Practice ${focus.toLowerCase()} during at least one key session.`,
    "Validate lighting, layers, and emergency kit setup.",
    "Dial in fueling: 60-90 g carbs/hour + consistent fluids.",
    "Create a pacing plan with planned stop durations."
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="glass overflow-hidden rounded-3xl border border-white/10">
        <div className="space-y-3 p-6">
          <p className="tag">BRM plan</p>
          <h1 className="text-3xl font-semibold text-white">
            BRM {distanceKm} ({distanceMiles} mi)
          </h1>
          <p className="text-slate-300">{description}</p>
          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
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
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/brm-checklist" className="btn-ghost">
              Back to checklist
            </Link>
            <button type="button" className="btn-primary">
              Log completion
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-3xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white">Readiness checklist</h2>
          <p className="mt-2 text-sm text-slate-300">
            Hit these checkpoints before your BRM attempt.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            {planChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white">Plan your attempt</h3>
            <p className="mt-2 text-sm text-slate-300">
              Capture your window, goals, and preparation notes for BRM {distanceKm}.
            </p>
          </div>
          <ChallengeForm window={window} focus={focus} distanceKm={distanceKm} />
        </div>
      </div>
    </div>
  );
};

export default BrmPlan;
