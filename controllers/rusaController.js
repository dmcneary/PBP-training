const { getCache, setCache } = require("../lib/cacheStore");

const RUSA_BASE = process.env.RUSA_BASE_URL || "https://rusa.org";
const BASE_CGI = `${RUSA_BASE}/cgi-bin/`;

const decodeHtmlEntities = (value) => {
  if (!value) return "";
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
};

const stripTags = (value) =>
  decodeHtmlEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  try {
    return new URL(href, BASE_CGI).toString();
  } catch (error) {
    return null;
  }
};

const extractRows = (html) => {
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi);
  return rows || [];
};

const extractCells = (row) => {
  const cells = row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
  return cells.map((cell) => stripTags(cell));
};

const extractLinks = (htmlSnippet) => {
  const links = Array.from(htmlSnippet.matchAll(/href\s*=\s*["']([^"']+)["']/gi)).map(
    (match) => toAbsoluteUrl(match[1])
  );
  return links.filter(Boolean);
};

const extractRegionIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("region");
  } catch (error) {
    return null;
  }
};

const splitRegionLabel = (value) => {
  const match = value.match(/^([A-Z]{2})\s*:\s*(.+)$/);
  if (!match) {
    return {
      regionCode: null,
      regionName: value.trim()
    };
  }
  return {
    regionCode: match[1],
    regionName: match[2].trim()
  };
};

const parseDistanceKm = (value) => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:k|km)\b/i);
  if (match) return Number(match[1]);
  const fallback = value.match(/\d+(?:\.\d+)?/);
  return fallback ? Number(fallback[0]) : null;
};

const fetchHtml = async (path) => {
  const headers = {
    "User-Agent": "FitMonkeys/1.0 (PBP training app)",
    Accept: "text/html,application/xhtml+xml"
  };
  const url = new URL(path, `${RUSA_BASE}/`).toString();
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = new Error("Unable to fetch RUSA data");
    error.status = response.status;
    throw error;
  }

  return {
    html: await response.text(),
    sourceUrl: url
  };
};

const parseRegions = (html) => {
  const rows = extractRows(html);
  const dedupe = new Map();

  rows.forEach((row) => {
    const cells = extractCells(row);
    if (cells.length < 2) return;

    const links = extractLinks(row);
    const eventsUrl = links.find((link) => link.includes("eventsearch_PF.pl")) || null;
    const infoUrl = links.find((link) => !link.includes("eventsearch_PF.pl")) || null;
    const regionId = extractRegionIdFromUrl(eventsUrl) || extractRegionIdFromUrl(infoUrl);
    if (!regionId) return;

    const { regionCode, regionName } = splitRegionLabel(cells[0]);
    const clubName = cells[1];

    dedupe.set(regionId, {
      regionId,
      regionCode,
      regionName,
      clubName,
      eventsUrl,
      infoUrl
    });
  });

  return Array.from(dedupe.values());
};

const parseEvents = (html) => {
  const rows = extractRows(html);
  const events = [];

  rows.forEach((row) => {
    const cells = extractCells(row);
    if (cells.length < 4) return;

    const links = extractLinks(row);
    const [regionCell = "", type = "", date = "", distanceCell = "", route = "", website = ""] = cells;
    const regionMeta = splitRegionLabel(regionCell);
    const regionId = extractRegionIdFromUrl(links.find((link) => link.includes("region=")) || "");

    events.push({
      regionId,
      regionCode: regionMeta.regionCode,
      regionName: regionMeta.regionName,
      type,
      date,
      distanceKm: parseDistanceKm(distanceCell),
      route: route || null,
      website: website || null,
      eventUrl: links[0] || null,
      links
    });
  });

  return events;
};

const parseResults = (html) => {
  const rows = extractRows(html);
  const results = [];

  rows.forEach((row) => {
    const cells = extractCells(row);
    if (cells.length < 3) return;

    results.push({
      cells,
      links: extractLinks(row)
    });
  });

  return results;
};

const listRegions = async (req, res) => {
  const cacheKey = "rusa:regions";
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const { html, sourceUrl } = await fetchHtml("cgi-bin/regionsearch_PF.pl");
    const regions = parseRegions(html);

    const payload = {
      updatedAt: new Date().toISOString(),
      sourceUrl,
      regions
    };

    await setCache(cacheKey, payload);
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

  const cacheKey = `rusa:events:${region}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const path = `cgi-bin/eventsearch_PF.pl?region=${encodeURIComponent(region)}&sortby=date`;
    const { html, sourceUrl } = await fetchHtml(path);
    const events = parseEvents(html);

    const payload = {
      updatedAt: new Date().toISOString(),
      regionId: region,
      sourceUrl,
      events
    };

    await setCache(cacheKey, payload);
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

  const cacheKey = `rusa:results:${region}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const path = `cgi-bin/resultsearch_PF.pl?region=${encodeURIComponent(region)}`;
    const { html, sourceUrl } = await fetchHtml(path);
    const results = parseResults(html).slice(0, 30);

    const payload = {
      updatedAt: new Date().toISOString(),
      regionId: region,
      sourceUrl,
      results
    };

    await setCache(cacheKey, payload);
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
