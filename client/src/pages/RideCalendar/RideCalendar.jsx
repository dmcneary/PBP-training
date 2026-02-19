import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const statusBadge = {
  planned: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  completed: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  skipped: "border-amber-400/40 bg-amber-400/10 text-amber-200"
};

const buildEventFingerprint = (event, regionId) => {
  return [
    regionId || "",
    (event.date || "").trim(),
    (event.route || "").trim().toLowerCase(),
    event.eventUrl || ""
  ].join("|");
};

const parseRideDate = (dateValue) => {
  const parsed = Date.parse(dateValue || "");
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
};

const formatRideDate = (dateValue) => {
  const date = parseRideDate(dateValue);
  if (!date) return dateValue || "Date TBD";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

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
    if (regions.length === 0 || selectedRegions.length > 0) return;
    const pch = regions.find((region) =>
      region.clubName.toLowerCase().includes("pch randonneurs")
    );
    if (pch) {
      setSelectedRegions([pch.regionId]);
      if (user && !user?.clubRegionIds?.length) {
        setDirty(true);
      }
    }
  }, [regions, selectedRegions.length, user]);

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
    if (selectedRegions.length === 0) return;
    let isMounted = true;
    setLoadingEvents(true);

    Promise.all(
      selectedRegions.map((regionId) =>
        axios
          .get(`/api/rusa/events?region=${regionId}`)
          .then((response) => ({ regionId, data: response.data }))
          .catch(() => ({ regionId, data: { events: [] } }))
      )
    ).then((responses) => {
      if (!isMounted) return;
      const nextEvents = {};
      responses.forEach(({ regionId, data }) => {
        nextEvents[regionId] = data.events || [];
      });
      setEventsByRegion(nextEvents);
      setLoadingEvents(false);
    });

    Promise.all(
      selectedRegions.map((regionId) =>
        axios
          .get(`/api/rusa/results?region=${regionId}`)
          .then((response) => ({ regionId, data: response.data }))
          .catch(() => ({ regionId, data: { results: [] } }))
      )
    ).then((responses) => {
      if (!isMounted) return;
      const nextResults = {};
      responses.forEach(({ regionId, data }) => {
        nextResults[regionId] = data.results || [];
      });
      setResultsByRegion(nextResults);
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
    const parsedDate = parseRideDate(event.date);
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
        rideName: event.route || `${event.distanceKm || ""}k brevet`.trim(),
        rideDate: parsedDate.toISOString(),
        distanceKm: event.distanceKm,
        eventUrl: event.eventUrl,
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
              Start with PCH Randonneurs and add any other regions you ride with.
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
              placeholder="Search PCH, San Diego, Los Angeles..."
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
                      Event page
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
          const events = eventsByRegion[region.regionId] || [];
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
                {events.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No events returned yet. Try refreshing or open the full calendar.
                  </p>
                ) : (
                  events.slice(0, 6).map((event) => {
                    const eventFingerprint = buildEventFingerprint(event, region.regionId);
                    const existingPlan = plannedByFingerprint[eventFingerprint];
                    return (
                      <div key={`${event.date}-${event.route}-${region.regionId}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {event.type || "Brevet"}
                        </p>
                        <h4 className="mt-2 text-base font-semibold text-white">
                          {event.route || "Route to be announced"}
                        </h4>
                        <p className="mt-2 text-sm text-slate-300">
                          {event.date} - {event.distanceKm ? `${event.distanceKm} km` : "Distance TBD"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {event.eventUrl ? (
                            <a className="btn-ghost" href={event.eventUrl} target="_blank" rel="noreferrer">
                              Event info
                            </a>
                          ) : null}
                          {event.website ? (
                            <span>{event.website}</span>
                          ) : null}
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            className="btn-primary"
                            disabled={!user || Boolean(existingPlan) || actionState[eventFingerprint] === "saving"}
                            onClick={() => saveRidePlan(event, region)}
                          >
                            {existingPlan
                              ? "Planned"
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
