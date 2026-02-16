const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

const PRIMARY_BASE = process.env.RUSA_BASE_URL || "https://rusa.org";
const FALLBACK_BASE = "https://dev.rusa.org";

const stripTags = (value) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const toAbsoluteUrl = (href, baseCgi) => {
  if (!href) return null;
  try {
    return new URL(href, baseCgi).toString();
  } catch (error) {
    return null;
  }
};

const setCache = (key, data) => {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, data });
};

const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const fetchWithFallback = async (path) => {
  const headers = { "User-Agent": "FitMonkeys/1.0 (PBP training app)" };
  const primaryUrl = new URL(path, `${PRIMARY_BASE}/`).toString();
  const primaryResponse = await fetch(primaryUrl, { headers });
  if (primaryResponse.ok) {
    return {
      html: await primaryResponse.text(),
      baseCgi: `${PRIMARY_BASE}/cgi-bin/`,
      sourceUrl: primaryUrl
    };
  }

  const fallbackUrl = new URL(path, `${FALLBACK_BASE}/`).toString();
  const fallbackResponse = await fetch(fallbackUrl, { headers });
  if (!fallbackResponse.ok) {
    const error = new Error("Unable to fetch RUSA data");
    error.status = fallbackResponse.status;
    throw error;
  }

  return {
    html: await fallbackResponse.text(),
    baseCgi: `${FALLBACK_BASE}/cgi-bin/`,
    sourceUrl: fallbackUrl
  };
};

const parseRows = (html) => html.split(/<\/tr>/gi).filter((row) => row.includes("<td"));

const extractCells = (row) => {
  const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
  return cells.map((cell) => stripTags(cell));
};

const extractLinks = (row, baseCgi) => {
  const links = Array.from(row.matchAll(/href=["']([^"']+)["']/gi)).map(
    (match) => toAbsoluteUrl(match[1], baseCgi)
  );
  return links.filter(Boolean);
};

const parseRegions = (html, baseCgi) => {
  const rows = parseRows(html);
  const regions = [];

  rows.forEach((row) => {
    const cells = extractCells(row);
    if (cells.length < 2) return;

    const regionCell = cells[0];
    const clubCell = cells[1];
    const regionMatch = regionCell.match(/\((\d+)\)/);
    if (!regionMatch) return;

    const regionId = regionMatch[1];
    const regionName = regionCell.replace(/\(\d+\)/, "").trim();
    const links = extractLinks(row, baseCgi);
    const eventsUrl = links.find((link) => link.includes("eventsearch")) || null;
    const infoUrl = links.find((link) => !link.includes("eventsearch")) || null;

    regions.push({
      regionId,
      regionName,
      clubName: clubCell,
      eventsUrl,
      infoUrl
    });
  });

  return regions;
};

const parseEvents = (html, baseCgi) => {
  const rows = parseRows(html);
  const events = [];

  rows.forEach((row) => {
    const cells = extractCells(row);
    if (cells.length < 4) return;

    const links = extractLinks(row, baseCgi);
    const [regionCell, typeCell, dateCell, distanceCell, routeCell, websiteCell] = cells;
    const regionMatch = regionCell.match(/\((\d+)\)/);
    const regionId = regionMatch ? regionMatch[1] : null;
    const regionName = regionCell.replace(/\(\d+\)/, "").trim();
    const distanceKm = Number(distanceCell.replace(/[^0-9.]/g, "")) || null;

    events.push({
      regionId,
      regionName,
      type: typeCell,
      date: dateCell,
      distanceKm,
      route: routeCell || websiteCell,
      website: websiteCell || null,
      eventUrl: links[0] || null,
      links
    });
  });

  return events;
};

const parseResults = (html, baseCgi) => {
  const rows = parseRows(html);
  const results = [];

  rows.forEach((row) => {
    const cells = extractCells(row);
    if (cells.length < 3) return;

    results.push({
      cells,
      links: extractLinks(row, baseCgi)
    });
  });

  return results;
};

const listRegions = async (req, res) => {
  const cached = getCache("regions");
  if (cached) {
    return res.json(cached);
  }

  try {
    const { html, baseCgi, sourceUrl } = await fetchWithFallback(
      "cgi-bin/regionsearch_PF.pl"
    );
    const regions = parseRegions(html, baseCgi);
    const payload = {
      updatedAt: new Date().toISOString(),
      sourceUrl,
      regions
    };
    setCache("regions", payload);
    return res.json(payload);
  } catch (error) {
    return res.status(502).json({ error: "Unable to fetch RUSA regions." });
  }
};

const listEvents = async (req, res) => {
  const { region } = req.query;
  if (!region) {
    return res.status(400).json({ error: "Region is required." });
  }

  const cacheKey = `events:${region}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const { html, baseCgi, sourceUrl } = await fetchWithFallback(
      `cgi-bin/eventsearch_PF.pl?region=${encodeURIComponent(region)}&sortby=date`
    );
    const events = parseEvents(html, baseCgi);
    const payload = {
      updatedAt: new Date().toISOString(),
      regionId: region,
      sourceUrl,
      events
    };
    setCache(cacheKey, payload);
    return res.json(payload);
  } catch (error) {
    return res.status(502).json({ error: "Unable to fetch RUSA events." });
  }
};

const listResults = async (req, res) => {
  const { region } = req.query;
  if (!region) {
    return res.status(400).json({ error: "Region is required." });
  }

  const cacheKey = `results:${region}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const { html, baseCgi, sourceUrl } = await fetchWithFallback(
      `cgi-bin/resultsearch_PF.pl?region=${encodeURIComponent(region)}`
    );
    const results = parseResults(html, baseCgi).slice(0, 30);
    const payload = {
      updatedAt: new Date().toISOString(),
      regionId: region,
      sourceUrl,
      results
    };
    setCache(cacheKey, payload);
    return res.json(payload);
  } catch (error) {
    return res.status(502).json({ error: "Unable to fetch RUSA results." });
  }
};

module.exports = {
  listRegions,
  listEvents,
  listResults
};
