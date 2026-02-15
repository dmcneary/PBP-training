const ChallengeForm = ({ window, focus, distanceKm }) => {
  return (
    <form className="glass space-y-4 rounded-3xl border border-white/10 p-6">
      <div>
        <label className="text-sm text-slate-300">Target window</label>
        <input
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          type="text"
          placeholder={window || "May - June"}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-slate-300">Longest recent ride</label>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            type="text"
            placeholder="160 km / 5h 40m"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Primary focus</label>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            type="text"
            placeholder={focus || "Night riding"}
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-300">Fueling strategy</label>
        <input
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          type="text"
          placeholder="Target 70-90 g carbs/hour + 500-750 ml fluids"
        />
      </div>
      <div>
        <label className="text-sm text-slate-300">Notes + risk flags</label>
        <textarea
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          rows="4"
          placeholder={`What will make BRM ${distanceKm || "200"} feel smooth?`}
        />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">
        Save plan
      </button>
    </form>
  );
};

export default ChallengeForm;
