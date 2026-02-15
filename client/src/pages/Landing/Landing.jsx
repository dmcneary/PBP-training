import ChallengeCard from "../../components/ChallengeCard";
import card from "../../utils/card.json";
import img3 from "../../Images/girlHike.jpg";
import img4 from "../../Images/runBeach.jpg";
import img5 from "../../Images/bikeWoman.jpg";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="tag">2026 fitness intelligence</span>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Train with clarity, not noise.
          </h1>
          <p className="text-lg text-slate-300">
            Fit Monkeys turns every workout file into a living performance story.
            Track your pace, power, and heart rate with a dashboard that feels like
            a coach, not a spreadsheet.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-primary">
              Start free
            </Link>
            <Link to="/challenges" className="btn-ghost">
              Explore challenges
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Workouts", value: "3.4k+" },
              { label: "Challenges", value: "24" },
              { label: "Avg PRs", value: "+12%" }
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-4 py-3">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="glass absolute -left-6 top-6 hidden w-40 rounded-2xl px-4 py-3 text-xs text-slate-300 shadow-lift md:block">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Live signal
            </p>
            <p className="mt-2 text-white">HRV stable</p>
            <p>Sleep +12%</p>
          </div>
          <img
            src={img5}
            alt="Cyclist training"
            className="h-[420px] w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="glass absolute -bottom-6 right-6 hidden rounded-2xl px-5 py-4 text-sm text-slate-200 shadow-glow md:block">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
              Athlete summary
            </p>
            <p className="mt-2 text-lg text-white">Zone 2: 2h 14m</p>
            <p>Power avg: 198w</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[img3, img4, img5].map((img, index) => (
          <div key={img} className="glass overflow-hidden rounded-3xl">
            <img
              src={img}
              alt={`Training moment ${index + 1}`}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <p className="text-sm text-slate-400">Training focus</p>
              <h3 className="text-lg font-semibold text-white">
                {index === 0
                  ? "Endurance blocks"
                  : index === 1
                    ? "Race readiness"
                    : "Power intervals"}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Visualize the work that actually moves your fitness needle.
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="tag">Challenges</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Run your next adventure
            </h2>
            <p className="mt-2 max-w-xl text-slate-300">
              Curated experiences with pacing tips, course visuals, and
              performance targets.
            </p>
          </div>
          <Link to="/challenges" className="btn-ghost">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {card.slice(0, 4).map((challenge) => (
            <ChallengeCard key={challenge.id} {...challenge} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
