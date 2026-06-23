const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongoServer;
const configuredTestMongoUri = process.env.MONGODB_TEST_URI;
const realFetch = global.fetch;
let userCounter = 0;

const assertSafeTestDatabase = () => {
  const dbName = mongoose.connection.name || "";
  if (!/test/i.test(dbName)) {
    throw new Error(`Refusing to drop non-test database: ${dbName}`);
  }
};

const buildUser = (overrides = {}) => {
  userCounter += 1;
  return {
    username: overrides.username || `testuser-${userCounter}`,
    password: overrides.password || "p@ssw0rd!",
    firstName: "Test",
    lastName: "User",
    gender: "other",
    age: 28,
    location: "Los Angeles",
    ...overrides
  };
};

const buildActivity = () => ({
  userId: "spoofed-user",
  actTitle: "Morning Run",
  actDesc: "Easy miles",
  durationMins: 30,
  durationSecs: 15,
  distance: 3.2,
  sportType: "running"
});

const buildPlannedRide = () => ({
  regionId: "12",
  regionName: "Southern California",
  clubName: "PCH Randonneurs",
  rideName: "300k coastal brevet",
  rideDate: "2026-05-02",
  distanceKm: 300,
  eventUrl: "https://rusa.org/cgi-bin/eventsearch_PF.pl?region=12",
  eventFingerprint: "12|2026-05-02|300k coastal brevet|event-12-300k"
});

beforeAll(async () => {
  if (configuredTestMongoUri) {
    process.env.MONGODB_URI = configuredTestMongoUri;
  } else {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        ip: "127.0.0.1",
        port: 0
      }
    });
    process.env.MONGODB_URI = mongoServer.getUri("pbp-planner-test");
  }
  process.env.SECRET = "test-secret";
  delete process.env.RWGPS_API_KEY;
  delete process.env.RWGPS_AUTH_TOKEN;
  delete process.env.RWGPS_ALLOW_SERVER_CREDENTIAL_IMPORTS;
  app = require("../app");

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once("open", resolve);
    });
  }
  assertSafeTestDatabase();
  await mongoose.connection.dropDatabase();
}, 20000);

afterAll(async () => {
  global.fetch = realFetch;
  if (mongoose.connection.readyState === 1) {
    assertSafeTestDatabase();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("auth and sessions", () => {
  it("returns null when no session exists", async () => {
    const res = await request(app).get("/user");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("rejects signups with missing fields", async () => {
    const res = await request(app).post("/user").send({ username: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("creates a user and starts a session on login", async () => {
    const user = buildUser();
    await request(app).post("/user").send(user).expect(200);

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const sessionRes = await agent.get("/user").expect(200);
    expect(sessionRes.body.user.username).toBe(user.username);
  });

  it("rejects invalid login credentials", async () => {
    const res = await request(app).post("/user/login").send({
      username: "missing-user",
      password: "bad"
    });
    expect(res.status).toBe(401);
  });
});

describe("activities", () => {
  it("requires auth for user-scoped activity listing", async () => {
    const res = await request(app).get("/api/activities");
    expect(res.status).toBe(401);
  });

  it("creates activities for the logged-in user only", async () => {
    const user = buildUser();
    await request(app).post("/user").send(user).expect(200);

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const createRes = await agent
      .post("/api/activities")
      .send(buildActivity())
      .expect(200);

    expect(createRes.body.userId).toBe(user.username);

    const listRes = await agent.get("/api/activities").expect(200);
    expect(listRes.body.length).toBeGreaterThan(0);

    await request(app).get("/api/all-activities").expect(401);
    const feedRes = await agent.get("/api/all-activities").expect(200);
    expect(feedRes.body.length).toBeGreaterThan(0);
  });

  it("allows multiple manual activities for the same user", async () => {
    const user = buildUser();
    await request(app).post("/user").send(user).expect(200);

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    await agent
      .post("/api/activities")
      .send({ ...buildActivity(), actTitle: "Manual ride one" })
      .expect(200);
    await agent
      .post("/api/activities")
      .send({ ...buildActivity(), actTitle: "Manual ride two" })
      .expect(200);

    const listRes = await agent.get("/api/activities").expect(200);
    expect(listRes.body.filter((item) => item.userId === user.username)).toHaveLength(2);
  });

  it("scopes activity detail, update, and delete to the owner", async () => {
    const owner = buildUser();
    const other = buildUser();
    await request(app).post("/user").send(owner).expect(200);
    await request(app).post("/user").send(other).expect(200);

    const ownerAgent = request.agent(app);
    await ownerAgent
      .post("/user/login")
      .send({ username: owner.username, password: owner.password })
      .expect(200);
    const otherAgent = request.agent(app);
    await otherAgent
      .post("/user/login")
      .send({ username: other.username, password: other.password })
      .expect(200);

    const createRes = await ownerAgent
      .post("/api/activities")
      .send(buildActivity())
      .expect(200);
    const activityId = createRes.body._id;

    await request(app).get(`/api/activities/${activityId}`).expect(401);
    await otherAgent.get(`/api/activities/${activityId}`).expect(404);
    await otherAgent
      .put(`/api/activities/${activityId}`)
      .send({ actTitle: "Hijacked" })
      .expect(404);
    await otherAgent.delete(`/api/activities/${activityId}`).expect(404);

    const updateRes = await ownerAgent
      .put(`/api/activities/${activityId}`)
      .send({ actTitle: "Owner edit", userId: "spoofed-owner" })
      .expect(200);
    expect(updateRes.body.actTitle).toBe("Owner edit");
    expect(updateRes.body.userId).toBe(owner.username);

    await ownerAgent.delete(`/api/activities/${activityId}`).expect(200);
  });

  it("rejects activity creation when required fields are missing", async () => {
    const user = buildUser({
      username: "edgecase",
      password: "edgecase"
    });
    await request(app).post("/user").send(user).expect(200);

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const res = await agent.post("/api/activities").send({ actTitle: "Bad" });
    expect(res.status).toBe(422);
  });
});

describe("planned rides", () => {
  it("requires auth for planned ride endpoints", async () => {
    const res = await request(app).get("/api/planned-rides");
    expect(res.status).toBe(401);
  });

  it("creates, lists, updates, and deletes planned rides", async () => {
    const user = buildUser({
      username: "planner",
      password: "planner"
    });
    await request(app).post("/user").send(user).expect(200);

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const createRes = await agent
      .post("/api/planned-rides")
      .send(buildPlannedRide())
      .expect(200);

    expect(createRes.body.userId).toBe(user.username);
    expect(createRes.body.status).toBe("planned");
    expect(createRes.body.qualificationSlot).toBe("brm300");
    expect(createRes.body.eventFingerprint).not.toBe(buildPlannedRide().eventFingerprint);

    await agent
      .post("/api/planned-rides")
      .send(buildPlannedRide())
      .expect(409);

    const listRes = await agent.get("/api/planned-rides").expect(200);
    expect(listRes.body.length).toBeGreaterThan(0);

    const rideId = createRes.body._id;
    const updateRes = await agent
      .put(`/api/planned-rides/${rideId}`)
      .send({ status: "completed", notes: "Strong pacing in the final 80k." })
      .expect(200);

    expect(updateRes.body.status).toBe("completed");
    expect(updateRes.body.notes).toContain("Strong pacing");

    await agent.delete(`/api/planned-rides/${rideId}`).expect(200);
    const afterDelete = await agent.get("/api/planned-rides").expect(200);
    expect(afterDelete.body.find((ride) => ride._id === rideId)).toBeUndefined();
  });

  it("prevents planned ride duplicate bypasses and derives qualification from distance", async () => {
    const user = buildUser();
    await request(app).post("/user").send(user).expect(200);
    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const first = await agent
      .post("/api/planned-rides")
      .send({
        ...buildPlannedRide(),
        distanceKm: 200,
        qualificationSlot: "brm600",
        eventFingerprint: "client-controlled-one"
      })
      .expect(200);

    expect(first.body.qualificationSlot).toBe("brm200");

    await agent
      .post("/api/planned-rides")
      .send({
        ...buildPlannedRide(),
        distanceKm: 200,
        sourceEventId: "different-source-event",
        routeUrl: "https://example.com/different-route",
        eventFingerprint: "client-controlled-two"
      })
      .expect(409);
  });

  it("scopes planned ride updates and deletes to the owner", async () => {
    const owner = buildUser();
    const other = buildUser();
    await request(app).post("/user").send(owner).expect(200);
    await request(app).post("/user").send(other).expect(200);

    const ownerAgent = request.agent(app);
    await ownerAgent
      .post("/user/login")
      .send({ username: owner.username, password: owner.password })
      .expect(200);
    const otherAgent = request.agent(app);
    await otherAgent
      .post("/user/login")
      .send({ username: other.username, password: other.password })
      .expect(200);

    const createRes = await ownerAgent
      .post("/api/planned-rides")
      .send(buildPlannedRide())
      .expect(200);

    await otherAgent
      .put(`/api/planned-rides/${createRes.body._id}`)
      .send({ status: "completed" })
      .expect(404);
    await otherAgent.delete(`/api/planned-rides/${createRes.body._id}`).expect(404);
  });
});

describe("rwgps imports", () => {
  const mockJsonResponse = (payload, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload)
  });

  it("requires auth for rwgps import", async () => {
    const res = await request(app).post("/api/rwgps/import");
    expect(res.status).toBe(401);
  });

  it("imports rides from Ride with GPS and skips duplicates", async () => {
    const user = {
      ...buildUser(),
      username: "rwgps-user",
      password: "rwgps-user"
    };
    await request(app).post("/user").send(user).expect(200);

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse({ user: { id: 4242 } }))
      .mockResolvedValueOnce(
        mockJsonResponse({
          trips: [
            {
              id: 9001,
              name: "Saturday 200k",
              description: "Steady endurance pace",
              departed_at: "2026-02-01T08:00:00Z",
              distance_km: 200,
              moving_time: 25200
            },
            {
              id: 9002,
              name: "Recovery spin",
              departed_at: "2026-02-02T08:00:00Z",
              distance_meters: 40233,
              moving_time: 4800
            }
          ]
        })
      )
      .mockResolvedValueOnce(mockJsonResponse({ user: { id: 4242 } }))
      .mockResolvedValueOnce(
        mockJsonResponse({
          trips: [
            {
              id: 9001,
              name: "Saturday 200k",
              departed_at: "2026-02-01T08:00:00Z",
              distance_km: 200,
              moving_time: 25200
            }
          ]
        })
      );

    global.fetch = fetchMock;

    const firstImport = await agent
      .post("/api/rwgps/import")
      .send({ apiKey: "key", authToken: "token", limit: 10 })
      .expect(200);

    expect(firstImport.body.importedCount).toBe(2);
    expect(firstImport.body.skippedCount).toBe(0);

    const secondImport = await agent
      .post("/api/rwgps/import")
      .send({ apiKey: "key", authToken: "token", limit: 10 })
      .expect(200);

    expect(secondImport.body.importedCount).toBe(0);
    expect(secondImport.body.skippedCount).toBe(1);

    const listRes = await agent.get("/api/activities").expect(200);
    const importedTitles = listRes.body.map((item) => item.actTitle);
    expect(importedTitles).toContain("Saturday 200k");
    expect(importedTitles).toContain("Recovery spin");
  });
});
