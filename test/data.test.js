"use strict";

// Data-integrity tests. The key invariant: every food's stored certainty must
// equal the tier the engine COMPUTES from its recorded evidence. If someone
// edits a verdict or an evidence fact and they fall out of sync, this fails.

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../scoring.js");
const { FOODS, ASSESSMENTS, NUTRIGRADE_RUBRIC, METHODOLOGY_VERSION } = require("../data.js");

const EFFECTS = ["positive", "negative", "neutral"];
const CERTAINTIES = ["high", "moderate", "low", "very-low"];

const ENUMS = {
  heterogeneity: ["low", "moderate", "high", "unknown"],
  outcomeType: ["hard", "surrogate", "indirect"],
  doseResponse: ["graded", "some", "none"],
  rctLevel: ["outcomes", "pathway", "pattern", "markers", "mechanism", "none"],
  funding: ["independent", "mixed", "industry", "unknown"],
  pubBias: ["tested-clean", "suspected", "untested"],
  confoundingRisk: ["low", "moderate", "high"],
};

test("dataset is non-empty and versioned", () => {
  assert.ok(FOODS.length > 0);
  assert.match(METHODOLOGY_VERSION, /^\d+\.\d+$/);
});

test("rubric display constants match the engine", () => {
  assert.equal(NUTRIGRADE_RUBRIC.max, S.MAX);
  assert.deepEqual(NUTRIGRADE_RUBRIC.thresholds, S.THRESHOLDS);
  assert.equal(NUTRIGRADE_RUBRIC.dimensions.length, 8);
});

test("food ids are unique and well-formed", () => {
  const seen = new Set();
  for (const f of FOODS) {
    assert.match(f.id, /^[a-z0-9-]+$/, `bad id: ${f.id}`);
    assert.ok(!seen.has(f.id), `duplicate id: ${f.id}`);
    seen.add(f.id);
  }
});

test("every food has the required, valid fields and >=1 study", () => {
  for (const f of FOODS) {
    assert.ok(EFFECTS.includes(f.effect), `${f.id}: bad effect ${f.effect}`);
    assert.ok(CERTAINTIES.includes(f.certainty), `${f.id}: bad certainty ${f.certainty}`);
    for (const k of ["name", "category", "summary", "rationale", "lastReviewed"]) {
      assert.ok(f[k] && String(f[k]).length, `${f.id}: missing ${k}`);
    }
    assert.ok(Array.isArray(f.studies) && f.studies.length >= 1, `${f.id}: no studies`);
    for (const st of f.studies) {
      for (const k of ["citation", "type", "finding"]) {
        assert.ok(st[k] && String(st[k]).length, `${f.id}: study missing ${k}`);
      }
    }
    assert.ok(Array.isArray(f.revisions), `${f.id}: revisions must be an array`);
  }
});

test("every food has an assessment with valid evidence facts", () => {
  for (const f of FOODS) {
    const a = ASSESSMENTS[f.id];
    assert.ok(a, `${f.id}: no assessment`);
    assert.ok(a.effectEstimate && a.effectEstimate.length, `${f.id}: no effectEstimate`);
    const e = a.evidence;
    assert.ok(e, `${f.id}: no evidence`);
    assert.ok(typeof e.pooledRR === "number" && e.pooledRR > 0, `${f.id}: bad pooledRR`);
    assert.ok(typeof e.ciExcludesNull === "boolean", `${f.id}: bad ciExcludesNull`);
    assert.ok(typeof e.participants === "number" && e.participants > 0, `${f.id}: bad participants`);
    for (const key of Object.keys(ENUMS)) {
      assert.ok(ENUMS[key].includes(e[key]), `${f.id}: bad ${key}=${e[key]}`);
    }
  }
});

test("no orphan assessments (every assessment maps to a food)", () => {
  const ids = new Set(FOODS.map((f) => f.id));
  for (const id of Object.keys(ASSESSMENTS)) {
    assert.ok(ids.has(id), `orphan assessment: ${id}`);
  }
});

test("CENTRAL INVARIANT: stored certainty equals the computed tier for every food", () => {
  for (const f of FOODS) {
    const computed = S.assess(ASSESSMENTS[f.id].evidence);
    assert.equal(
      f.certainty,
      computed.tier,
      `${f.id}: stored certainty "${f.certainty}" != computed "${computed.tier}" (total ${computed.total}/${S.MAX})`
    );
  }
});

test("ciExcludesNull is consistent with a directional verdict", () => {
  // A positive/negative verdict should rest on an interval that excludes no-effect;
  // a neutral verdict should not claim one.
  for (const f of FOODS) {
    const e = ASSESSMENTS[f.id].evidence;
    if (f.effect === "neutral") {
      assert.equal(e.ciExcludesNull, false, `${f.id}: neutral but ciExcludesNull=true`);
    } else {
      assert.equal(e.ciExcludesNull, true, `${f.id}: directional but ciExcludesNull=false`);
    }
  }
});
