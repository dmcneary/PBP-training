import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const statusBadge = {
  planned: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  completed: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  skipped: "border-amber-400/40 bg-amber-400/10 text-amber-200"
};

const buildEventFingerprint = (event, regionId) => {
  return [
    event.regionId || regionId || "",
    (event.dateISO || event.date || "").trim(),
    (event.routeName || event.route || "").trim().toLowerCase(),
    event.eventId || "",
    event.routeUrl || "",
    event.sourceUrl || ""
  ].join("|");
};

const parseRideDate = (dateValue) => {
  const rawValue = String(dateValue || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return new Date(`${rawValue}T12:00:00.000Z`);
  }
  const parsed = Date.parse(rawValue);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
};

const formatRideDate = (dateValue) => {
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
  const date = parseRideDate(rawValue);
  if (!date) return rawValue || "Date TBD";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const eventName = (event) =>
  event.routeName || event.route || "Route to be announced";

const eventDate = (event) => event.dateISO || event.date || "";

const sortEventsForDisplay = (events) =>
  [...events].sort((a, b) => {
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
    const aTime = Date.parse(eventDate(a));
    const bTime = Date.parse(eventDate(b));
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return a.isPast ? bTime - aTime : aTime - bTime;
  });

const RideCalendar = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [eventsByRegion, setEventsByRegion] = useState({});
  const [resultsByRegion, setResultsByRegion] = useState({});
  const [plannedRides, setPlannedRides] = useState([]);
  const [plannedLoaded, setPlannedLoaded] = useState(false);
  const [actionState, setActionState] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [regionFetchState, setRegionFetchState] = useState({});

  useEffect(() => {
    let isMounted = true;
    axios
      .get("/user")
      .then((response) => {
        if (!isMounted) return;
        const currentUser = response.data.user;
        setUser(currentUser);
        if (currentUser?.clubRegionIds?.length) {
          setSelectedRegions(currentUser.clubRegionIds);
        }
        setUserLoaded(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setUserLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    axios
      .get("/api/rusa/regions")
      .then((response) => {
        if (!isMounted) return;
        const nextRegions = response.data.regions || [];
        setRegions(nextRegions);
        setLoadingRegions(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadingRegions(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userLoaded || regions.length === 0 || selectedRegions.length > 0) return;
    const pch = regions.find((region) =>
      region.regionId === "58" ||
      region.clubName.toLowerCase().includes("pacific coast highway randonneurs") ||
      region.clubName.toLowerCase().includes("pch randonneurs")
    );
    if (pch) {
      setSelectedRegions([pch.regionId]);
      if (user && !user?.clubRegionIds?.length) {
        setDirty(true);
      }
    }
  }, [regions, selectedRegions.length, user, userLoaded]);

  useEffect(() => {
    if (!user || !dirty) return;
    let isMounted = true;
    setSaveState("saving");
    axios
      .put("/user/clubs", { clubRegionIds: selectedRegions })
      .then((response) => {
        if (!isMounted) return;
        setUser(response.data.user || user);
        setSaveState("saved");
        setDirty(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSaveState("error");
      });
    return () => {
      isMounted = false;
    };
  }, [dirty, selectedRegions, user]);

  useEffect(() => {
    if (!userLoaded || !user) {
      setPlannedRides([]);
      if (userLoaded) setPlannedLoaded(true);
      return;
    }

    let isMounted = true;
    axios
      .get("/api/planned-rides")
      .then((response) => {
        if (!isMounted) return;
        setPlannedRides(response.data || []);
        setPlannedLoaded(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setPlannedLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [user, userLoaded]);

  useEffect(() => {
    if (selectedRegions.length === 0) {
      setEventsByRegion({});
      setResultsByRegion({});
      setRegionFetchState({});
      return;
    }
    let isMounted = true;
    setLoadingEvents(true);
    setRegionFetchState((prev) =>
      selectedRegions.reduce((next, regionId) => {
        next[regionId] = { ...(prev[regionId] || {}), events: "loading", results: prev[regionId]?.results || "idle" };
        return next;
      }, {})
    );

    Promise.all(
      selectedRegions.map((regionId) =>
        axios
          .get(`/api/rusa/events?region=${regionId}`)
          .then((response) => ({ regionId, data: response.data, ok: true }))
          .catch(() => ({ regionId, data: { events: [] }, ok: false }))
      )
    ).then((responses) => {
      if (!isMounted) return;
      const nextEvents = {};
      const nextState = {};
      responses.forEach(({ regionId, data }) => {
        nextEvents[regionId] = data.events || [];
        nextState[regionId] = { events: responses.find((item) => item.regionId === regionId)?.ok ? "success" : "error" };
      });
      setEventsByRegion(nextEvents);
      setRegionFetchState((prev) => {
        const merged = { ...prev };
        responses.forEach(({ regionId, ok }) => {
          merged[regionId] = { ...(merged[regionId] || {}), events: ok ? "success" : "error" };
        });
        return merged;
      });
      setLoadingEvents(false);
    });

    setRegionFetchState((prev) =>
      selectedRegions.reduce((next, regionId) => {
        next[regionId] = { ...(prev[regionId] || {}), results: "loading" };
        return next;
      }, { ...prev })
    );

    Promise.all(
      selectedRegions.map((regionId) =>
        axios
          .get(`/api/rusa/results?region=${regionId}`)
          .then((response) => ({ regionId, data: response.data, ok: true }))
          .catch(() => ({ regionId, data: { results: [] }, ok: false }))
      )
    ).then((responses) => {
      if (!isMounted) return;
      const nextResults = {};
      responses.forEach(({ regionId, data }) => {
        nextResults[regionId] = data.results || [];
      });
      setResultsByRegion(nextResults);
      setRegionFetchState((prev) => {
        const merged = { ...prev };
        responses.forEach(({ regionId, ok }) => {
          merged[regionId] = { ...(merged[regionId] || {}), results: ok ? "success" : "error" };
        });
        return merged;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [selectedRegions]);

  const filteredRegions = useMemo(() => {
    if (!searchTerm) return regions;
    const term = searchTerm.toLowerCase();
    return regions.filter(
      (region) =>
        region.clubName.toLowerCase().includes(term) ||
        region.regionName.toLowerCase().includes(term)
    );
  }, [regions, searchTerm]);

  const selectedRegionData = useMemo(
    () => regions.filter((region) => selectedRegions.includes(region.regionId)),
    [regions, selectedRegions]
  );

  const plannedByFingerprint = useMemo(() => {
    const lookup = {};
    plannedRides.forEach((ride) => {
      if (ride.eventFingerprint) {
        lookup[ride.eventFingerprint] = ride;
      }
    });
    return lookup;
  }, [plannedRides]);

  const sortedPlannedRides = useMemo(() => {
    const next = [...plannedRides];
    next.sort((a, b) => {
      const aTime = parseRideDate(a.rideDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      const bTime = parseRideDate(b.rideDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
    return next;
  }, [plannedRides]);

  const toggleRegion = (regionId) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
    setDirty(true);
  };

  const saveRidePlan = (event, region) => {
    if (!user) return;

    const eventFingerprint = buildEventFingerprint(event, region.regionId);
    const parsedDate = parseRideDate(eventDate(event));
    if (!parsedDate) {
      setActionState((prev) => ({
        ...prev,
        [eventFingerprint]: "error"
      }));
      return;
    }

    setActionState((prev) => ({ ...prev, [eventFingerprint]: "saving" }));

    axios
      .post("/api/planned-rides", {
        regionId: region.regionId,
        regionName: region.regionName,
        clubName: region.clubName,
        rideName: eventName(event) || `${event.distanceKm || ""}k brevet`.trim(),
        rideDate: parsedDate.toISOString(),
        distanceKm: event.distanceKm,
        climbingFeet: event.climbingFeet,
        eventUrl: event.sourceUrl,
        routeUrl: event.routeUrl,
        sourceEventId: event.eventId,
        eventFingerprint
      })
      .then((response) => {
        setPlannedRides((prev) => [response.data, ...prev]);
        setActionState((prev) => ({ ...prev, [eventFingerprint]: "saved" }));
      })
      .catch((error) => {
        if (error?.response?.status === 409) {
          setActionState((prev) => ({ ...prev, [eventFingerprint]: "exists" }));
          return;
        }
        setActionState((prev) => ({ ...prev, [eventFingerprint]: "error" }));
      });
  };

  const updatePlannedRide = (rideId, updates) => {
    setActionState((prev) => ({ ...prev, [rideId]: "saving" }));
    axios
      .put(`/api/planned-rides/${rideId}`, updates)
      .then((response) => {
        const updatedRide = response.data;
        setPlannedRides((prev) =>
          prev.map((ride) => (ride._id === rideId ? updatedRide : ride))
        );
        setActionState((prev) => ({ ...prev, [rideId]: "saved" }));
      })
      .catch(() => {
        setActionState((prev) => ({ ...prev, [rideId]: "error" }));
      });
  };

  const deletePlannedRide = (rideId) => {
    setActionState((prev) => ({ ...prev, [rideId]: "saving" }));
    axios
      .delete(`/api/planned-rides/${rideId}`)
      .then(() => {
        setPlannedRides((prev) => prev.filter((ride) => ride._id !== rideId));
        setActionState((prev) => ({ ...prev, [rideId]: "saved" }));
      })
      .catch(() => {
        setActionState((prev) => ({ ...prev, [rideId]: "error" }));
      });
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="space-y-3">
        <p className="tag">Calendar + results</p>
        <h1 className="text-3xl font-semibold text-white">
          RUSA Club Calendars
        </h1>
        <p className="max-w-3xl text-slate-300">
          Pull upcoming brevets and recent results straight from RUSA. Choose one
          or more clubs, because your memberships and your ride calendar do not
          have to be the same.
        </p>
      </header>

      <section className="glass rounded-3xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Select clubs</h2>
            <p className="text-sm text-slate-300">
              Start with Pacific Coast Highway Randonneurs and add any other regions you ride with.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass rounded-2xl px-4 py-2 text-sm text-slate-300">
              {selectedRegions.length} selected
            </div>
            {userLoaded ? (
              user ? (
                <span className="text-xs text-slate-400">
                  {saveState === "saving"
                    ? "Saving to profile..."
                    : saveState === "error"
                      ? "Save failed"
                      : "Saved to profile"}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Log in to save clubs
                </span>
              )
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr]">
          <div>
            <label className="text-sm text-slate-300">Find a club</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Pacific Coast Highway, San Diego, Los Angeles..."
            />
            {loadingRegions ? (
              <p className="mt-4 text-sm text-slate-400">Loading RUSA clubs...</p>
            ) : (
              <p className="mt-4 text-xs text-slate-400">
                Data from RUSA region listings.
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredRegions.slice(0, 12).map((region) => (
              <label
                key={region.regionId}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedRegions.includes(region.regionId)}
                  onChange={() => toggleRegion(region.regionId)}
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {region.clubName}
                  </p>
                  <p className="text-xs text-slate-400">{region.regionName}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Planned rides</h2>
            <p className="text-sm text-slate-300">
              Save events from club calendars and keep your brevet season plan in one place.
            </p>
          </div>
        </div>
        {!user ? (
          <div className="glass rounded-3xl border border-white/10 p-6 text-sm text-slate-300">
            Log in to save planned rides.
          </div>
        ) : !plannedLoaded ? (
          <div className="glass rounded-3xl border border-white/10 p-6 text-sm text-slate-300">
            Loading planned rides...
          </div>
        ) : sortedPlannedRides.length === 0 ? (
          <div className="glass rounded-3xl border border-white/10 p-6 text-sm text-slate-300">
            No planned rides yet. Use "Save plan" on an event below.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedPlannedRides.map((ride) => (
              <div key={ride._id} className="glass rounded-3xl border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {ride.clubName || ride.regionName || "Club"}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{ride.rideName}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {formatRideDate(ride.rideDate)}
                      {ride.distanceKm ? ` - ${ride.distanceKm} km` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusBadge[ride.status] || statusBadge.planned}`}>
                    {ride.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  {ride.status !== "completed" ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => updatePlannedRide(ride._id, { status: "completed" })}
                    >
                      Mark completed
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => updatePlannedRide(ride._id, { status: "planned" })}
                    >
                      Mark planned
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => deletePlannedRide(ride._id)}
                  >
                    Remove
                  </button>
                  {ride.eventUrl ? (
                    <a className="btn-ghost" href={ride.eventUrl} target="_blank" rel="noreferrer">
                      Calendar page
                    </a>
                  ) : null}
                  {ride.routeUrl ? (
                    <a className="btn-ghost" href={ride.routeUrl} target="_blank" rel="noreferrer">
                      Route
                    </a>
                  ) : null}
                  {actionState[ride._id] === "error" ? (
                    <span className="text-xs text-rose-300">Update failed</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Upcoming brevets</h2>
            <p className="text-sm text-slate-300">
              Pulled from RUSA event calendars for each selected region.
            </p>
          </div>
          {loadingEvents ? (
            <span className="text-sm text-slate-400">Refreshing...</span>
          ) : null}
        </div>
        {selectedRegionData.map((region) => {
          const events = sortEventsForDisplay(eventsByRegion[region.regionId] || []);
          const fetchState = regionFetchState[region.regionId]?.events || "idle";
          return (
            <div key={region.regionId} className="glass rounded-3xl border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {region.regionName}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {region.clubName}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  {region.infoUrl ? (
                    <a className="btn-ghost" href={region.infoUrl} target="_blank" rel="noreferrer">
                      Club site
                    </a>
                  ) : null}
                  {region.eventsUrl ? (
                    <a className="btn-primary" href={region.eventsUrl} target="_blank" rel="noreferrer">
                      Full calendar
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {fetchState === "loading" || fetchState === "idle" ? (
                  <p className="text-sm text-slate-400">
                    Loading this club calendar...
                  </p>
                ) : fetchState === "error" ? (
                  <p className="text-sm text-amber-200">
                    Could not load this club calendar. Open the full calendar to check RUSA directly.
                  </p>
                ) : events.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No events returned yet. The 2027 calendar may not be published for this club; open the full calendar to confirm.
                  </p>
                ) : (
                  events.map((event) => {
                    const eventFingerprint = buildEventFingerprint(event, region.regionId);
                    const existingPlan = plannedByFingerprint[eventFingerprint];
                    return (
                      <div
                        key={`${event.eventId || eventDate(event)}-${eventName(event)}-${region.regionId}`}
                        className={`rounded-2xl border border-white/10 bg-slate-950/50 p-4 ${event.isPast ? "opacity-70" : ""}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {event.type || "Brevet"}
                          </p>
                          <span className={`rounded-full border px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] ${
                            event.isPast
                              ? "border-slate-500/40 bg-slate-500/10 text-slate-300"
                              : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                          }`}>
                            {event.isPast ? "Past" : "Upcoming"}
                          </span>
                        </div>
                        <h4 className="mt-2 text-base font-semibold text-white">
                          {eventName(event)}
                        </h4>
                        <p className="mt-2 text-sm text-slate-300">
                          {formatRideDate(eventDate(event))} - {event.distanceKm ? `${event.distanceKm} km` : "Distance TBD"}
                          {event.climbingFeet ? ` - ${event.climbingFeet.toLocaleString()} ft` : ""}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {event.routeUrl ? (
                            <a className="btn-ghost" href={event.routeUrl} target="_blank" rel="noreferrer">
                              Route
                            </a>
                          ) : null}
                          {event.clubUrl ? (
                            <a className="btn-ghost" href={event.clubUrl} target="_blank" rel="noreferrer">
                              Club site
                            </a>
                          ) : null}
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            className="btn-primary"
                            disabled={!user || event.isPast || Boolean(existingPlan) || actionState[eventFingerprint] === "saving"}
                            onClick={() => saveRidePlan(event, region)}
                          >
                            {existingPlan
                              ? "Planned"
                              : event.isPast
                                ? "Past event"
                              : actionState[eventFingerprint] === "saving"
                                ? "Saving..."
                                : "Save plan"}
                          </button>
                          {actionState[eventFingerprint] === "error" ? (
                            <span className="text-rose-300">Could not save this ride</span>
                          ) : null}
                          {actionState[eventFingerprint] === "exists" ? (
                            <span className="text-amber-300">Already planned</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Recent results</h2>
          <p className="text-sm text-slate-300">
            Pulled from RUSA results searches. Some result data may require a
            RUSA login depending on availability.
          </p>
        </div>
        {selectedRegionData.map((region) => {
          const results = resultsByRegion[region.regionId] || [];
          return (
            <div key={`${region.regionId}-results`} className="glass rounded-3xl border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {region.regionName}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {region.clubName}
                  </h3>
                </div>
                <a
                  className="btn-ghost"
                  href={`https://rusa.org/cgi-bin/resultsearch_PF.pl?region=${region.regionId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open results search
                </a>
              </div>
              <div className="mt-4 space-y-3">
                {results.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No results returned yet for this region.
                  </p>
                ) : (
                  results.slice(0, 6).map((result, index) => (
                    <div key={`${region.regionId}-result-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                      {result.cells.join(" - ")}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default RideCalendar;
