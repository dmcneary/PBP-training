const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongoServer;
const usingExternalMongo = Boolean(process.env.MONGODB_URI);

const buildUser = () => ({
  username: "testuser",
  password: "p@ssw0rd!",
  firstName: "Test",
  lastName: "User",
  gender: "other",
  age: 28,
  location: "Los Angeles"
});

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
  if (!usingExternalMongo) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        ip: "127.0.0.1",
        port: 0
      }
    });
    process.env.MONGODB_URI = mongoServer.getUri();
  }
  process.env.SECRET = "test-secret";
  app = require("../app");

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once("open", resolve);
    });
  }
  await mongoose.connection.dropDatabase();
}, 20000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
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

    const publicRes = await request(app).get("/api/all-activities").expect(200);
    expect(publicRes.body.length).toBeGreaterThan(0);
  });

  it("rejects activity creation when required fields are missing", async () => {
    const user = {
      ...buildUser(),
      username: "edgecase",
      password: "edgecase"
    };
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
    const user = {
      ...buildUser(),
      username: "planner",
      password: "planner"
    };
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
});
