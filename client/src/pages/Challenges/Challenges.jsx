import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BrmCard from "../../components/BrmCard";
import brmData from "../../utils/brm.json";
import { buildQualificationSummary } from "../../utils/qualification";

const parseCalendarDate = (dateValue) => {
  const rawValue = String(dateValue || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return new Date(`${rawValue}T12:00:00.000Z`).getTime();
  }
  return Date.parse(rawValue);
};

const formatCalendarDate = (dateValue) => {
  const rawValue = String(dateValue || "");
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

const BrmChecklist = () => {
  const [user, setUser] = useState(null);
  const [clubRegions, setClubRegions] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [plannedRides, setPlannedRides] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [planWarning, setPlanWarning] = useState("");

  useEffect(() => {
    let isMounted = true;
    axios
      .get("/user")
      .then((response) => {
        if (!isMounted) return;
        const currentUser = response.data.user || null;
        const ids = currentUser?.clubRegionIds || [];
        setUser(currentUser);
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
    if (!user) {
      setPlannedRides([]);
      setActivities([]);
      setLoadingPlan(false);
      return;
    }

    let isMounted = true;
    setLoadingPlan(true);
    setPlanWarning("");
    Promise.allSettled([
      axios.get("/api/planned-rides"),
      axios.get("/api/activities")
    ])
      .then(([plannedResult, activitiesResult]) => {
        if (!isMounted) return;
        if (plannedResult.status === "fulfilled") {
          setPlannedRides(plannedResult.value.data || []);
        }
        if (activitiesResult.status === "fulfilled") {
          setActivities(activitiesResult.value.data || []);
        }
        if (plannedResult.status === "rejected" || activitiesResult.status === "rejected") {
          setPlanWarning("Some qualification evidence could not load. Showing the data that is available.");
        }
        setLoadingPlan(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadingPlan(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

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
      const parsed = parseCalendarDate(event.dateISO);
      if (event.isPast || Number.isNaN(parsed) || parsed < now) {
        return closest;
      }
      if (!closest || parsed < closest.parsedDate) {
        return { ...event, parsedDate: parsed };
      }
      return closest;
    }, null);
  }, [clubEvents]);

  const qualificationSummary = useMemo(
    () => buildQualificationSummary({ plannedRides, activities }),
    [plannedRides, activities]
  );
  const completedCount = Object.values(qualificationSummary).filter(
    (slot) => slot.status === "completed"
  ).length;
  const formattedNextDate = nextClubEvent
    ? formatCalendarDate(nextClubEvent.dateISO)
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
            {loadingPlan ? "Loading plan..." : `${completedCount}/${brmData.length} completed`}
          </div>
          {planWarning ? (
            <div className="glass rounded-2xl px-4 py-2 text-xs text-amber-200">
              {planWarning}
            </div>
          ) : null}
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
            status={qualificationSummary[brevet.id]?.status}
            match={
              qualificationSummary[brevet.id]?.status === "missing"
                ? null
                : qualificationSummary[brevet.id]
            }
          />
        ))}
      </div>
    </div>
  );
};

export default BrmChecklist;
