import BrmCard from "../../components/BrmCard";
import brmData from "../../utils/brm.json";
import img3 from "../../Images/girlHike.jpg";
import img4 from "../../Images/runBeach.jpg";
import img5 from "../../Images/bikeWoman.jpg";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="tag">PBP readiness 2027</span>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Train for Paris-Brest-Paris with confidence.
          </h1>
          <p className="text-lg text-slate-300">
            Fit Monkeys turns your ride files into a PBP readiness score, pacing
            guidance, and a clear checklist for each BRM qualifying brevet.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-primary">
              Start your plan
            </Link>
            <Link to="/brm-checklist" className="btn-ghost">
              View BRM checklist
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "BRMs required", value: "4" },
              { label: "PBP distance", value: "1200 km" },
              { label: "Finish window", value: "90 hours" }
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
              Readiness
            </p>
            <p className="mt-2 text-white">Endurance stable</p>
            <p>HR drift +4%</p>
          </div>
          <img
            src={img5}
            alt="Cyclist training for PBP"
            className="h-[420px] w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="glass absolute -bottom-6 right-6 hidden rounded-2xl px-5 py-4 text-sm text-slate-200 shadow-glow md:block">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
              Long ride
            </p>
            <p className="mt-2 text-lg text-white">Zone 2: 5h 32m</p>
            <p>Fueling: 82 g/hr</p>
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
                  ? "Endurance durability"
                  : index === 1
                    ? "Night riding"
                    : "Pacing discipline"}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Turn every ride into a repeatable checklist for PBP day.
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="tag">BRM checklist</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Qualify with the right brevets
            </h2>
            <p className="mt-2 max-w-xl text-slate-300">
              Track each required BRM, plan your timing window, and keep
              preparation on schedule.
            </p>
          </div>
          <Link to="/brm-checklist" className="btn-ghost">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {brmData.map((brevet, index) => (
            <BrmCard
              key={brevet.id}
              {...brevet}
              status={index === 0 ? "planned" : "missing"}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
