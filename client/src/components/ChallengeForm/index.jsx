const ChallengeForm = () => {
  return (
    <form className="glass space-y-4 rounded-3xl border border-white/10 p-6">
      <div>
        <label className="text-sm text-slate-300">Username</label>
        <input
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          type="text"
          placeholder="Your handle"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-slate-300">Age</label>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            type="number"
            placeholder="28"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Level</label>
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-emerald-300 focus:outline-none">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-300">Message</label>
        <textarea
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          rows="4"
          placeholder="Tell the host what you’re training for."
        />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">
        Submit
      </button>
    </form>
  );
};

export default ChallengeForm;
