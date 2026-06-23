const { getCache, setCache } = require("../lib/cacheStore");
const { parseRegions, parseEvents, parseResults } = require("../lib/rusaParser");

const RUSA_BASE = process.env.RUSA_BASE_URL || "https://rusa.org";

const fetchHtml = async (path) => {
  const headers = {
    "User-Agent": "PBPPlanner/1.0 (PBP training app)",
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

const listRegions = async (req, res) => {
  const cacheKey = "rusa:regions";
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const { html, sourceUrl } = await fetchHtml("cgi-bin/regionsearch_PF.pl");
    const regions = parseRegions(html, { baseUrl: RUSA_BASE });

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
    const events = parseEvents(html, { baseUrl: RUSA_BASE, sourceUrl });

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
    const results = parseResults(html, { baseUrl: RUSA_BASE }).slice(0, 30);

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
