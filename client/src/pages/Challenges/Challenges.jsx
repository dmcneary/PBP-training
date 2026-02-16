import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BrmCard from "../../components/BrmCard";
import brmData from "../../utils/brm.json";

const BrmChecklist = () => {
  const statusById = {
    "brm-200": "planned",
    "brm-300": "missing",
    "brm-400": "missing",
    "brm-600": "missing"
  };

  const [clubRegions, setClubRegions] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  useEffect(() => {
    let isMounted = true;
    axios
      .get("/user")
      .then((response) => {
        if (!isMounted) return;
        const ids = response.data.user?.clubRegionIds || [];
        setClubRegions(ids);
      })
      .catch(() => {
        if (!isMounted) return;
        setClubRegions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (clubRegions.length === 0) return;
    let isMounted = true;
    setLoadingCalendar(true);

    Promise.all(
      clubRegions.map((regionId) =>
        axios
          .get(`/api/rusa/events?region=${regionId}`)
          .then((response) => response.data.events || [])
          .catch(() => [])
      )
    ).then((responses) => {
      if (!isMounted) return;
      setClubEvents(responses.flat());
      setLoadingCalendar(false);
    });

    return () => {
      isMounted = false;
    };
  }, [clubRegions]);

  const nextClubEvent = useMemo(() => {
    if (clubEvents.length === 0) return null;
    const now = Date.now();

    return clubEvents.reduce((closest, event) => {
      const parsed = Date.parse(event.date);
      if (Number.isNaN(parsed) || parsed < now) {
        return closest;
      }
      if (!closest || parsed < closest.parsedDate) {
        return { ...event, parsedDate: parsed };
      }
      return closest;
    }, null);
  }, [clubEvents]);

  const completedCount = 0;
  const formattedNextDate = nextClubEvent
    ? new Date(nextClubEvent.parsedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : null;

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
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass rounded-2xl px-4 py-2 text-sm text-slate-300">
            {completedCount}/{brmData.length} completed
          </div>
          <Link
            to="/ride-calendar"
            className="glass rounded-2xl px-4 py-2 text-left text-sm text-slate-300"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Club calendar
            </span>
            <span className="mt-1 block text-white">
              {loadingCalendar
                ? "Loading club brevets…"
                : nextClubEvent
                  ? `${formattedNextDate} · ${nextClubEvent.distanceKm || "Distance TBD"} km · ${nextClubEvent.regionName}`
                  : "Add clubs to see your next brevet"}
            </span>
          </Link>
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
