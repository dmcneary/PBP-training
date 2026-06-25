const fs = require("fs");
const path = require("path");
const { parseRegions, parseEvents, parseResults } = require("../lib/rusaParser");

const readFixture = (name) =>
  fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");

describe("RUSA parser", () => {
  it("parses current region tables and finds PCH as region 58", () => {
    const regions = parseRegions(readFixture("rusa-regions.html"));
    const pch = regions.find((region) => region.clubName === "Pacific Coast Highway Randonneurs");

    expect(pch).toMatchObject({
      regionId: "58",
      regionCode: "CA",
      regionName: "Los Angeles",
      eventsUrl: "https://rusa.org/cgi-bin/eventsearch_PF.pl?region=58&sortby=region",
      infoUrl: "http://www.pchrandos.com/"
    });
  });

  it("parses current event tables with climbing, route, club URL, and past state", () => {
    const sourceUrl = "https://rusa.org/cgi-bin/eventsearch_PF.pl?region=58&sortby=date";
    const events = parseEvents(readFixture("rusa-events.html"), {
      sourceUrl,
      now: new Date("2026-06-23T12:00:00Z")
    });

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      eventId: "17705",
      regionId: "58",
      type: "ACP brevet",
      dateISO: "2026-06-20",
      distanceKm: 300,
      climbingFeet: 6640,
      routeName: "LA Union Station to SD Santa Fe Depot 300k",
      routeUrl: "https://rusa.org/cgi-bin/routesearch_PF.pl?rtid=3777",
      clubUrl: "http://www.pchrandos.com/",
      isPast: true,
      sourceUrl
    });
    expect(events[1]).toMatchObject({
      eventId: "17706",
      dateISO: "2026-07-18",
      distanceKm: 200,
      climbingFeet: 3225,
      routeName: "PCH Coastal 200K brevet",
      isPast: false
    });
  });

  it("returns no events for empty calendars", () => {
    const events = parseEvents(readFixture("rusa-empty-events.html"), {
      sourceUrl: "https://rusa.org/cgi-bin/eventsearch_PF.pl?region=12&sortby=date",
      now: new Date("2026-06-23T12:00:00Z")
    });

    expect(events).toEqual([]);
  });

  it("keeps result cells and links", () => {
    const results = parseResults(readFixture("rusa-results.html"));

    expect(results).toHaveLength(1);
    expect(results[0].cells).toEqual(["CA: Los Angeles", "2026/06/20", "LA Union Station", "Jane Rider"]);
    expect(results[0].links).toContain("https://rusa.org/cgi-bin/membersearch_PF.pl?mid=1234");
  });
});
