import { test } from "node:test";
import assert from "node:assert/strict";
import { track, setAnalyticsUser, initAnalytics } from "./analytics.ts";

test("track is a no-op before init (server-safe, no throw)", () => {
  assert.doesNotThrow(() => track("login", { method: "google" }));
});

test("track accepts a param-less event without throwing", () => {
  assert.doesNotThrow(() => track("logout", {}));
});

test("setAnalyticsUser is a no-op before init", () => {
  assert.doesNotThrow(() => setAnalyticsUser("uid-123"));
  assert.doesNotThrow(() => setAnalyticsUser(null));
});

test("initAnalytics resolves to no-op on the server (no window)", async () => {
  await assert.doesNotReject(() => initAnalytics());
});
