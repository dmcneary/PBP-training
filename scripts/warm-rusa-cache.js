if (process.env.NODE_ENV === "production" && !process.env.APP_BASE_URL) {
  throw new Error("APP_BASE_URL must be set for production cache warming.");
}

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3001";
const regionIds = (process.env.RUSA_WARM_REGION_IDS || "58")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const fetchJson = async (path) => {
  const url = new URL(path, appBaseUrl).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cache warm failed for ${url}: ${response.status}`);
  }
  return response.json();
};

const main = async () => {
  await fetchJson("/api/rusa/regions");
  for (const regionId of regionIds) {
    await fetchJson(`/api/rusa/events?region=${encodeURIComponent(regionId)}`);
    await fetchJson(`/api/rusa/results?region=${encodeURIComponent(regionId)}`);
  }
  console.log(`Warmed RUSA cache for regions: ${regionIds.join(", ")}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
