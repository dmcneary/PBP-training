const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongoServer;
const usingExternalMongo = Boolean(process.env.MONGODB_URI);

const buildUser = (overrides = {}) => ({
  username: "testuser",
  password: "p@ssw0rd!",
  firstName: "Test",
  lastName: "User",
  gender: "other",
  age: 28,
  location: "Los Angeles",
  ...overrides
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

const signupAndLogin = async (username) => {
  const user = buildUser({ username, password: `${username}-password` });
  await request(app).post("/user").send(user).expect(200);

  const agent = request.agent(app);
  await agent
    .post("/user/login")
    .send({ username: user.username, password: user.password })
    .expect(200);

  return { agent, user };
};

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
    const user = buildUser({ username: "session-user" });
    const signupRes = await request(app).post("/user").send(user).expect(200);
    expect(signupRes.body.username).toBe(user.username);
    expect(signupRes.body.password).toBeUndefined();

    const agent = request.agent(app);
    await agent
      .post("/user/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    const sessionRes = await agent.get("/user").expect(200);
    expect(sessionRes.body.user.username).toBe(user.username);
    expect(sessionRes.body.user.password).toBeUndefined();
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
  it("requires auth for every activity route", async () => {
    const activityId = new mongoose.Types.ObjectId().toString();

    await request(app).get("/api/all-activities").expect(401);
    await request(app).get("/api/activities").expect(401);
    await request(app).post("/api/activities").send(buildActivity()).expect(401);
    await request(app).get(`/api/activities/${activityId}`).expect(401);
    await request(app)
      .put(`/api/activities/${activityId}`)
      .send({ actTitle: "Nope" })
      .expect(401);
    await request(app).delete(`/api/activities/${activityId}`).expect(401);
  });

  it("creates activities for the logged-in user only", async () => {
    const { agent, user } = await signupAndLogin("activity-owner");

    const createRes = await agent
      .post("/api/activities")
      .send(buildActivity())
      .expect(200);

    expect(createRes.body.userId).toBe(user.username);

    const listRes = await agent.get("/api/activities").expect(200);
    expect(listRes.body.length).toBeGreaterThan(0);

    const allRes = await agent.get("/api/all-activities").expect(200);
    expect(allRes.body.length).toBeGreaterThan(0);
  });

  it("rejects activity creation when required fields are missing", async () => {
    const { agent } = await signupAndLogin("edgecase");

    const res = await agent.post("/api/activities").send({ actTitle: "Bad" });
    expect(res.status).toBe(422);
  });

  it("allows logged-in users to read activity details", async () => {
    const owner = await signupAndLogin("read-owner");
    const reader = await signupAndLogin("read-reader");

    const createRes = await owner.agent
      .post("/api/activities")
      .send(buildActivity())
      .expect(200);

    const detailRes = await reader.agent
      .get(`/api/activities/${createRes.body._id}`)
      .expect(200);

    expect(detailRes.body._id).toBe(createRes.body._id);
    expect(detailRes.body.userId).toBe(owner.user.username);
  });

  it("restricts activity updates and deletes to the owner", async () => {
    const owner = await signupAndLogin("write-owner");
    const otherUser = await signupAndLogin("write-other");

    const createRes = await owner.agent
      .post("/api/activities")
      .send(buildActivity())
      .expect(200);

    const activityId = createRes.body._id;

    await otherUser.agent
      .put(`/api/activities/${activityId}`)
      .send({ actTitle: "Hijacked" })
      .expect(404);

    await otherUser.agent.delete(`/api/activities/${activityId}`).expect(404);

    const updateRes = await owner.agent
      .put(`/api/activities/${activityId}`)
      .send({ actTitle: "Tempo Run", userId: "spoofed-update-user" })
      .expect(200);

    expect(updateRes.body.actTitle).toBe("Tempo Run");
    expect(updateRes.body.userId).toBe(owner.user.username);

    await owner.agent.delete(`/api/activities/${activityId}`).expect(200);
  });
});
