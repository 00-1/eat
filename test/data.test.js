"use strict";

// Data-integrity tests. The key invariant: every food's stored certainty must
// equal the tier the engine COMPUTES from its recorded evidence. If someone
// edits a verdict or an evidence fact and they fall out of sync, this fails.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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
    assert.ok(e.intakeBasis && e.intakeBasis.trim().length > 0, `${f.id}: missing intakeBasis (pooledRR must state its realistic-intake basis)`);
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

test("dose-response curves are well-formed and their shape label is derived, not invented", () => {
  for (const f of FOODS) {
    const c = ASSESSMENTS[f.id].doseCurve;
    if (!c) continue;
    assert.ok(Array.isArray(c.points) && c.points.length >= 2, `${f.id}: doseCurve needs >=2 points`);
    for (const p of c.points) {
      assert.ok(typeof p.x === "number", `${f.id}: curve point missing numeric x`);
      assert.ok(typeof p.rr === "number" && p.rr > 0, `${f.id}: curve point bad rr`);
    }
    assert.ok(S.DOSE_SHAPE[c.shape], `${f.id}: unknown dose shape "${c.shape}"`);
    assert.ok(c.outcome && c.outcome.length, `${f.id}: curve missing outcome`);
    assert.ok(c.source && c.source.cite, `${f.id}: curve missing source`);
    // The recorded shape must match what the engine derives from the points
    // (reproducibility) wherever there are enough points to judge.
    const derived = S.classifyDoseShape(c.points);
    if (derived) {
      assert.equal(c.shape, derived, `${f.id}: recorded shape "${c.shape}" != derived "${derived}"`);
    }
    if (c.verified) {
      assert.ok(/PMID:\s*\d+|10\.\d{4,}\//i.test(c.source.id || ""), `${f.id}: verified curve needs PMID/DOI`);
    }
  }
});

test("PROVENANCE: a source-verified food must cite its score-driving figures", () => {
  // The grounding pass flips `verified: true` only once the numeric facts that
  // drive the score (pooledRR, participants) are pinned to a real citation with a
  // PMID/DOI. This enforces that contract: you cannot mark a food verified without
  // sources. (Vacuously true until the first food is grounded.)
  for (const f of FOODS) {
    const a = ASSESSMENTS[f.id];
    if (!a.verified) continue;
    assert.ok(a.sources && typeof a.sources === "object", `${f.id}: verified but no sources`);
    for (const key of ["pooledRR", "participants"]) {
      const s = a.sources[key];
      assert.ok(s, `${f.id}: verified but sources.${key} missing`);
      assert.ok(s.figure && String(s.figure).length, `${f.id}: sources.${key} missing figure`);
      assert.ok(s.cite && String(s.cite).length, `${f.id}: sources.${key} missing cite`);
      assert.ok(/PMID:\s*\d+|10\.\d{4,}\//i.test(s.id || ""), `${f.id}: sources.${key}.id must be a PMID or DOI (got "${s.id}")`);
    }
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

test("METHODOLOGY.md header version matches METHODOLOGY_VERSION", () => {
  const md = fs.readFileSync(path.join(__dirname, "..", "METHODOLOGY.md"), "utf8");
  const m = md.match(/Version\s+(\d+\.\d+)/);
  assert.ok(m, "no version found in METHODOLOGY.md header");
  assert.equal(m[1], METHODOLOGY_VERSION, "doc header version != METHODOLOGY_VERSION");
});

test("a neutral food never advertises a non-minimal magnitude", () => {
  for (const f of FOODS) {
    const mag = S.classifyMagnitude(ASSESSMENTS[f.id].evidence, f.outcomes);
    if (f.effect === "neutral") {
      assert.equal(mag, "minimal", `${f.id}: neutral but magnitude=${mag}`);
    }
  }
});

test("directional verdicts obey the relaxed rule (>= Low; very-low falls back to neutral)", () => {
  // v0.9: a positive/negative label needs the interval to exclude the null and
  // certainty at least Low; Very-low must be neutral (leaning).
  for (const f of FOODS) {
    if (f.effect !== "neutral") {
      assert.notEqual(f.certainty, "very-low", `${f.id}: directional at very-low (must fall back to neutral)`);
    }
  }
});

test("explore: the observational-only preset weakens trans fat (worked example)", () => {
  // The headline case from the methodology: trans fat's High certainty leans on
  // its validated causal pathway, so judging on cohort data alone drops it.
  const tf = ASSESSMENTS["trans-fat"];
  assert.ok(tf, "expected a trans-fat assessment to exist");
  const canonical = S.assess(tf.evidence);
  const obsOnly = S.assess(tf.evidence, null, S.PRESETS["observational"].settings);
  assert.equal(canonical.tier, "high");
  assert.ok(
    S.CERTAINTY_ORDER[obsOnly.tier] < S.CERTAINTY_ORDER[canonical.tier],
    `expected observational-only to weaken trans fat from ${canonical.tier}, got ${obsOnly.tier}`
  );
});

test("explore: a preset never invents certainty (each food's diff is down or unchanged for observational-only)", () => {
  // Removing experimental credit can only lower or hold the tier, never raise it.
  for (const f of FOODS) {
    const e = ASSESSMENTS[f.id].evidence;
    const before = S.assess(e).tier;
    const after = S.assess(e, null, S.PRESETS["observational"].settings).tier;
    assert.ok(
      S.CERTAINTY_ORDER[after] <= S.CERTAINTY_ORDER[before],
      `${f.id}: observational-only raised certainty ${before} -> ${after}`
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
