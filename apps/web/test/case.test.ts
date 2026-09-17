import test from "node:test";
import assert from "node:assert/strict";
import { seedCase, roleSummary, settlementBadge, hasPersonalData, isRole } from "../src/case.js";

test("seedCase returns valid GenLayer and EVM testnet case graph", () => {
  const graph = seedCase();
  assert.equal(graph.environment, "testnet");
  assert.equal(graph.stages.length, 9);
  assert.equal(graph.investigations.length, 4);
  assert.equal(graph.capabilities.length, 6);
  assert.equal(settlementBadge(graph), "SETTLED");
});

test("roleSummary produces distinct views for counterparty, lp, and operator", () => {
  const graph = seedCase();
  const counterparty = roleSummary("counterparty", graph);
  assert.equal(counterparty.title, "Bilateral Counterparty (Party A / B)");
  assert.ok(counterparty.focus.includes("mode1-unlock"));

  const lp = roleSummary("facility_lp", graph);
  assert.equal(lp.title, "Facility Liquidity Provider");
  assert.ok(lp.focus.includes("mode2-fronting"));

  const operator = roleSummary("operator", graph);
  assert.equal(operator.title, "Protocol Operator / Steward");
  assert.ok(operator.focus.includes("strict-eq"));
});

test("isRole strictly validates role union", () => {
  assert.equal(isRole("counterparty"), true);
  assert.equal(isRole("facility_lp"), true);
  assert.equal(isRole("operator"), true);
  assert.equal(isRole("admin"), false);
  assert.equal(isRole(null), false);
});

test("hasPersonalData prevents leakage of sensitive secrets", () => {
  assert.equal(hasPersonalData({ user: "Alice", value: 100 }), false);
  assert.equal(hasPersonalData({ private_key: "0x12345" }), true);
  assert.equal(hasPersonalData({ secretKey: "abc" }), true);
  assert.equal(hasPersonalData({ email: "alice@example.com" }), true);
});
