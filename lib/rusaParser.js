const cheerio = require("cheerio");

const DEFAULT_RUSA_BASE = "https://rusa.org";

const cleanText = (value) =>
  String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const textFromCell = ($, cell) => cleanText($(cell).text());

const toAbsoluteUrl = (href, baseUrl = DEFAULT_RUSA_BASE) => {
  if (!href) return null;
  try {
    return new URL(href, `${baseUrl}/cgi-bin/`).toString();
  } catch (error) {
    return null;
  }
};

const firstLink = ($, cell, baseUrl) => {
  const href = $(cell).find("a[href]").first().attr("href");
  return toAbsoluteUrl(href, baseUrl);
};

const extractLinks = ($, row, baseUrl) =>
  $(row)
    .find("a[href]")
    .toArray()
    .map((link) => toAbsoluteUrl($(link).attr("href"), baseUrl))
    .filter(Boolean);

const extractRegionIdFromUrl = (url) => {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("region");
  } catch (error) {
    return null;
  }
};

const splitRegionLabel = (value) => {
  const label = cleanText(value);
  const match = label.match(/^([A-Z]{2})\s*:\s*(.+)$/);
  if (!match) {
    return {
      regionCode: null,
      regionName: label
    };
  }
  return {
    regionCode: match[1],
    regionName: match[2].trim()
  };
};

const parseDistanceKm = (value) => {
  const match = cleanText(value).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const parseClimbingFeet = (value) => {
  const match = cleanText(value).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const parseRusaDate = (value) => {
  const match = cleanText(value).match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const isDateBefore = (dateISO, now = new Date()) => {
  if (!dateISO) return false;
  const eventDate = new Date(`${dateISO}T23:59:59.999Z`);
  return eventDate.getTime() < now.getTime();
};

const buildEventId = ({ explicitId, regionId, dateISO, distanceKm, routeName }) => {
  if (explicitId) return String(explicitId);
  return [regionId || "", dateISO || "", distanceKm || "", routeName || ""]
    .join("|")
    .toLowerCase();
};

const parseRegions = (html, { baseUrl = DEFAULT_RUSA_BASE } = {}) => {
  const $ = cheerio.load(html);
  const dedupe = new Map();

  $("tr").each((_, row) => {
    const cells = $(row).find("td").toArray();
    if (cells.length < 3) return;

    const regionLabel = textFromCell($, cells[0]);
    const clubName = textFromCell($, cells[1]);
    const eventsUrl = firstLink($, cells[2], baseUrl);
    const infoUrl = firstLink($, cells[3], baseUrl);
    const regionId = extractRegionIdFromUrl(eventsUrl);

    if (!regionId || !regionLabel || !clubName) return;

    const { regionCode, regionName } = splitRegionLabel(regionLabel);
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

const parseEvents = (
  html,
  { baseUrl = DEFAULT_RUSA_BASE, sourceUrl = null, now = new Date() } = {}
) => {
  const $ = cheerio.load(html);
  const events = [];

  $("tr").each((_, row) => {
    const cells = $(row).find("td").toArray();
    if (cells.length < 6) return;

    const regionLabel = textFromCell($, cells[0]);
    const type = textFromCell($, cells[1]);
    const dateText = textFromCell($, cells[2]);
    const distanceCell = textFromCell($, cells[3]);
    const hasClimbingColumn = cells.length >= 7;
    const climbingCell = hasClimbingColumn ? textFromCell($, cells[4]) : "";
    const routeCell = hasClimbingColumn ? cells[5] : cells[4];
    const websiteCell = hasClimbingColumn ? cells[6] : cells[5];
    const routeName = textFromCell($, routeCell);

    if (!regionLabel || !type || !dateText) return;

    const { regionCode, regionName } = splitRegionLabel(regionLabel);
    const dateISO = parseRusaDate(dateText);
    const distanceKm = parseDistanceKm(distanceCell);
    const climbingFeet = hasClimbingColumn ? parseClimbingFeet(climbingCell) : null;
    const routeUrl = firstLink($, routeCell, baseUrl);
    const clubUrl = firstLink($, websiteCell, baseUrl);
    const eventId = buildEventId({
      explicitId: $(row).attr("eid"),
      regionId: extractRegionIdFromUrl(sourceUrl),
      dateISO,
      distanceKm,
      routeName
    });

    events.push({
      eventId,
      regionId: extractRegionIdFromUrl(sourceUrl),
      regionCode,
      regionName,
      type,
      dateISO,
      distanceKm,
      climbingFeet,
      routeName: routeName || null,
      routeUrl,
      clubUrl,
      isPast: cleanText($(row).attr("bgcolor")).toLowerCase() === "#aaaaaa" || isDateBefore(dateISO, now),
      sourceUrl
    });
  });

  return events;
};

const parseResults = (html, { baseUrl = DEFAULT_RUSA_BASE } = {}) => {
  const $ = cheerio.load(html);
  const results = [];

  $("tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .toArray()
      .map((cell) => textFromCell($, cell))
      .filter(Boolean);
    if (cells.length < 3) return;

    results.push({
      cells,
      links: extractLinks($, row, baseUrl)
    });
  });

  return results;
};

module.exports = {
  cleanText,
  parseRegions,
  parseEvents,
  parseResults,
  splitRegionLabel
};
