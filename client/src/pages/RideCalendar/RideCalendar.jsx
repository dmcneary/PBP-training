import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const STORAGE_KEY = "fit-monkeys:rusa-regions";

const RideCalendar = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [eventsByRegion, setEventsByRegion] = useState({});
  const [resultsByRegion, setResultsByRegion] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedRegions(parsed);
        }
      } catch (error) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
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
        if (selectedRegions.length === 0) {
          const pch = nextRegions.find((region) =>
            region.clubName.toLowerCase().includes("pch randonneurs")
          );
          if (pch) {
            setSelectedRegions([pch.regionId]);
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadingRegions(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedRegions.length]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedRegions));
  }, [selectedRegions]);

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

  const toggleRegion = (regionId) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
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
          <div className="glass rounded-2xl px-4 py-2 text-sm text-slate-300">
            {selectedRegions.length} selected
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
              <p className="mt-4 text-sm text-slate-400">Loading RUSA clubs…</p>
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
            <h2 className="text-2xl font-semibold text-white">Upcoming brevets</h2>
            <p className="text-sm text-slate-300">
              Pulled from RUSA event calendars for each selected region.
            </p>
          </div>
          {loadingEvents ? (
            <span className="text-sm text-slate-400">Refreshing…</span>
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
                  events.slice(0, 6).map((event) => (
                    <div key={`${event.date}-${event.route}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {event.type || "Brevet"}
                      </p>
                      <h4 className="mt-2 text-base font-semibold text-white">
                        {event.route || "Route to be announced"}
                      </h4>
                      <p className="mt-2 text-sm text-slate-300">
                        {event.date} · {event.distanceKm ? `${event.distanceKm} km` : "Distance TBD"}
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
                    </div>
                  ))
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
                      {result.cells.join(" • ")}
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
