import { buildQualificationSummary } from "./qualification";

describe("buildQualificationSummary", () => {
  it("marks planned and completed BRM slots from planned rides", () => {
    const summary = buildQualificationSummary({
      plannedRides: [
        {
          rideName: "Coastal 200k",
          distanceKm: 200,
          status: "planned",
          qualificationSlot: "brm200",
          rideDate: "2027-03-01"
        },
        {
          rideName: "Moorpark 300k",
          distanceKm: 300,
          status: "completed",
          qualificationSlot: "brm300",
          rideDate: "2027-04-01"
        }
      ]
    });

    expect(summary["brm-200"].status).toBe("planned");
    expect(summary["brm-300"].status).toBe("completed");
    expect(summary["brm-400"].status).toBe("missing");
  });

  it("uses brevet-like cycling activities as completed evidence", () => {
    const summary = buildQualificationSummary({
      activities: [
        {
          actTitle: "Saturday 400k brevet",
          actDate: "2027-05-01",
          distance: 249,
          sportType: "cycling",
          source: "rwgps"
        }
      ]
    });

    expect(summary["brm-400"].status).toBe("completed");
    expect(summary["brm-400"].sourceLabel).toContain("Ride with GPS");
  });

  it("ignores rides and activities outside the 2027 Audax season", () => {
    const summary = buildQualificationSummary({
      plannedRides: [
        {
          rideName: "Old 200k",
          distanceKm: 200,
          status: "completed",
          qualificationSlot: "brm200",
          rideDate: "2026-03-01"
        },
        {
          rideName: "Current 300k",
          distanceKm: 300,
          status: "completed",
          qualificationSlot: "brm300",
          rideDate: "2027-03-01"
        },
        {
          rideName: "Future 400k",
          distanceKm: 400,
          status: "completed",
          qualificationSlot: "brm400",
          rideDate: "2028-03-01"
        }
      ],
      activities: [
        {
          actTitle: "Old 600k brevet",
          actDate: "2026-06-01",
          distance: 373,
          sportType: "cycling",
          source: "rwgps"
        }
      ]
    });

    expect(summary["brm-200"].status).toBe("missing");
    expect(summary["brm-300"].status).toBe("completed");
    expect(summary["brm-400"].status).toBe("missing");
    expect(summary["brm-600"].status).toBe("missing");
  });
});
