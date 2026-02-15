import BrmCard from "../../components/BrmCard";
import brmData from "../../utils/brm.json";

const BrmChecklist = () => {
  const statusById = {
    "brm-200": "planned",
    "brm-300": "missing",
    "brm-400": "missing",
    "brm-600": "missing"
  };

  const completedCount = 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tag">BRM checklist</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            PBP Qualification Plan
          </h1>
          <p className="mt-2 text-slate-300">
            Plan, log, and track the four brevets required to start PBP 2027.
          </p>
        </div>
        <div className="glass rounded-2xl px-4 py-2 text-sm text-slate-300">
          {completedCount}/{brmData.length} completed
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {brmData.map((brevet) => (
          <BrmCard
            key={brevet.id}
            {...brevet}
            status={statusById[brevet.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default BrmChecklist;
