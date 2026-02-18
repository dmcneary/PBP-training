const DEFAULT_TTL_SECONDS = Number(process.env.RUSA_CACHE_TTL_SECONDS || 3600);
const memoryCache = new Map();

let redisClient;
let redisReady = false;
let redisInitAttempted = false;

const getMemory = (key) => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
};

const setMemory = (key, value, ttlSeconds) => {
  memoryCache.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    value
  });
};

const initRedis = async () => {
  if (redisInitAttempted) return redisReady;
  redisInitAttempted = true;

  if (!process.env.REDIS_URL) return false;

  let createClient;
  try {
    ({ createClient } = require("redis"));
  } catch (error) {
    return false;
  }

  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", () => {
      redisReady = false;
    });
    await redisClient.connect();
    redisReady = true;
    return true;
  } catch (error) {
    redisReady = false;
    return false;
  }
};

const getCache = async (key) => {
  const hasRedis = await initRedis();
  if (!hasRedis || !redisClient) {
    return getMemory(key);
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return getMemory(key);
  }
};

const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  setMemory(key, value, ttlSeconds);

  const hasRedis = await initRedis();
  if (!hasRedis || !redisClient) {
    return;
  }

  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    // fall back to in-memory cache only
  }
};

module.exports = {
  DEFAULT_TTL_SECONDS,
  getCache,
  setCache
};
