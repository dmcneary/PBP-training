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

const fetchHtml = async (baseUrl, path) => {
  const headers = {
    "User-Agent": "FitMonkeys/1.0 (PBP training app)",
    Accept: "text/html,application/xhtml+xml"
  };
  const url = new URL(path, `${baseUrl}/`).toString();
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = new Error("Unable to fetch RUSA data");
    error.status = response.status;
    throw error;
  }
  return {
    html: await response.text(),
    baseCgi: `${baseUrl}/cgi-bin/`,
    sourceUrl: url
  };
};

const parseRows = (html) => html.split(/<\/tr>/gi).filter((row) => /<td/i.test(row));

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
    let primary = await fetchHtml(PRIMARY_BASE, "cgi-bin/regionsearch_PF.pl");
    let regions = parseRegions(primary.html, primary.baseCgi);
    let sourceUrl = primary.sourceUrl;

    if (regions.length === 0 && PRIMARY_BASE !== FALLBACK_BASE) {
      const fallback = await fetchHtml(FALLBACK_BASE, "cgi-bin/regionsearch_PF.pl");
      regions = parseRegions(fallback.html, fallback.baseCgi);
      sourceUrl = fallback.sourceUrl;
    }

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
    const path = `cgi-bin/eventsearch_PF.pl?region=${encodeURIComponent(region)}&sortby=date`;
    let primary = await fetchHtml(PRIMARY_BASE, path);
    let events = parseEvents(primary.html, primary.baseCgi);
    let sourceUrl = primary.sourceUrl;

    if (events.length === 0 && PRIMARY_BASE !== FALLBACK_BASE) {
      const fallback = await fetchHtml(FALLBACK_BASE, path);
      events = parseEvents(fallback.html, fallback.baseCgi);
      sourceUrl = fallback.sourceUrl;
    }

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
    const path = `cgi-bin/resultsearch_PF.pl?region=${encodeURIComponent(region)}`;
    let primary = await fetchHtml(PRIMARY_BASE, path);
    let results = parseResults(primary.html, primary.baseCgi).slice(0, 30);
    let sourceUrl = primary.sourceUrl;

    if (results.length === 0 && PRIMARY_BASE !== FALLBACK_BASE) {
      const fallback = await fetchHtml(FALLBACK_BASE, path);
      results = parseResults(fallback.html, fallback.baseCgi).slice(0, 30);
      sourceUrl = fallback.sourceUrl;
    }

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
