"use strict";

// Data-integrity tests. The key invariant: every food's stored certainty must
// equal the tier the engine COMPUTES from its recorded evidence. If someone
// edits a verdict or an evidence fact and they fall out of sync, this fails.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const S = require("../scoring.js");
const { FOODS, ASSESSMENTS, NUTRIGRADE_RUBRIC, METHODOLOGY_VERSION, UNIFORMITY_NOTE, HOLDING_LIST, RESEARCHED_ON } = require("../data.js");

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

test("every food records a valid experimentalDirection (for the trials/mechanism lens)", () => {
  const ok = ["positive", "negative", "neutral", "none"];
  for (const f of FOODS) {
    const d = ASSESSMENTS[f.id].evidence.experimentalDirection;
    assert.ok(ok.includes(d), `${f.id}: bad experimentalDirection ${d}`);
  }
});

test("every food has a grounded MECHANISM record; experimentalDirection is derived from it", () => {
  const ok = ["positive", "negative", "neutral", "none"];
  for (const f of FOODS) {
    const m = ASSESSMENTS[f.id].mechanism;
    assert.ok(m, `${f.id}: no mechanism record`);
    assert.ok(ok.includes(m.direction), `${f.id}: bad mechanism.direction ${m.direction}`);
    // experimentalDirection must be DERIVED from the mechanism record, not diverge
    assert.equal(ASSESSMENTS[f.id].evidence.experimentalDirection, m.direction, `${f.id}: experimentalDirection != mechanism.direction`);
    for (const k of ["trial", "mechanism"]) {
      assert.ok(m[k] && String(m[k]).length > 15, `${f.id}: mechanism.${k} too thin`);
    }
    assert.ok(m.source && m.source.cite, `${f.id}: mechanism missing source cite`);
    assert.ok(/PMID:\s*\d+|10\.\d{4,}\//i.test(m.source.id || ""), `${f.id}: mechanism.source.id must be a PMID/DOI (got "${m.source.id}")`);
  }
  // the grounding pass eliminated all "none" directions
  const nones = FOODS.filter((f) => ASSESSMENTS[f.id].mechanism.direction === "none");
  assert.equal(nones.length, 0, `expected no 'none' mechanism directions, got: ${nones.map((f) => f.id).join(", ")}`);
});

test("per-outcome verdicts (where present) are well-formed and directionally coherent", () => {
  for (const f of FOODS) {
    const ovs = ASSESSMENTS[f.id].outcomeVerdicts;
    if (!ovs) continue;
    assert.ok(Array.isArray(ovs) && ovs.length, `${f.id}: empty outcomeVerdicts`);
    for (const ov of ovs) {
      assert.ok(ov.outcome && ov.outcome.length, `${f.id}: outcomeVerdict missing outcome`);
      assert.ok(["positive", "negative", "neutral"].includes(ov.effect), `${f.id}: bad ov effect ${ov.effect}`);
      assert.ok(ov.evidence && typeof ov.evidence.pooledRR === "number", `${f.id}: ov "${ov.outcome}" bad evidence`);
      // direction must match the evidence (same rule as foods)
      if (ov.effect === "neutral") {
        assert.ok(!S.isDirectional(ov.evidence), `${f.id}: ov "${ov.outcome}" neutral but evidence is directional`);
      } else {
        assert.ok(S.isDirectional(ov.evidence), `${f.id}: ov "${ov.outcome}" directional but evidence isn't`);
        const rr = ov.evidence.pooledRR;
        if (ov.effect === "positive") assert.ok(rr < 1, `${f.id}: ov "${ov.outcome}" positive but RR>=1`);
        if (ov.effect === "negative") assert.ok(rr > 1, `${f.id}: ov "${ov.outcome}" negative but RR<=1`);
      }
      if (ov.doseCurve) {
        const derived = S.classifyDoseShape(ov.doseCurve.points);
        if (derived) assert.equal(ov.doseCurve.shape, derived, `${f.id}: ov "${ov.outcome}" curve shape mismatch`);
      }
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
  const canonical = S.verdictUnderLens(tf.evidence, tf.outcomes || [], "default");
  const obsOnly = S.verdictUnderLens(tf.evidence, tf.outcomes || [], "observational");
  assert.equal(canonical.tier, "high");
  assert.equal(canonical.effect, "negative");
  assert.equal(obsOnly.effect, "negative"); // cohorts still say negative
  assert.ok(
    S.CERTAINTY_ORDER[obsOnly.tier] < S.CERTAINTY_ORDER[canonical.tier],
    `expected observational-only to weaken trans fat from ${canonical.tier}, got ${obsOnly.tier}`
  );
});

test("explore: the observational lens never raises certainty or flips direction", () => {
  // Removing experimental credit can only lower or hold the tier, never raise it,
  // and observation is our direction source so direction can't flip under it.
  for (const f of FOODS) {
    const e = ASSESSMENTS[f.id].evidence;
    const before = S.verdictUnderLens(e, f.outcomes, "default");
    const after = S.verdictUnderLens(e, f.outcomes, "observational");
    assert.ok(
      S.CERTAINTY_ORDER[after.tier] <= S.CERTAINTY_ORDER[before.tier],
      `${f.id}: observational lens raised certainty ${before.tier} -> ${after.tier}`
    );
    // direction stable unless a very-low fallback flips a directional verdict to neutral
    if (before.effect !== after.effect) {
      assert.equal(after.effect, "neutral", `${f.id}: observational lens changed direction to ${after.effect}`);
    }
  }
});

test("COHERENCE: a directional verdict's pooledRR points the right way", () => {
  // positive => protective (RR < 1); negative => harmful (RR > 1). Catches a
  // verdict whose recorded effect size contradicts its label.
  for (const f of FOODS) {
    const rr = ASSESSMENTS[f.id].evidence.pooledRR;
    if (f.effect === "positive") assert.ok(rr < 1, `${f.id}: positive but pooledRR ${rr} >= 1`);
    if (f.effect === "negative") assert.ok(rr > 1, `${f.id}: negative but pooledRR ${rr} <= 1`);
  }
});

test("component-context entries (where present) are well-formed", () => {
  for (const f of FOODS) {
    if (!f.components) continue;
    assert.ok(Array.isArray(f.components) && f.components.length, `${f.id}: empty components`);
    for (const c of f.components) {
      assert.ok(c.name && c.name.length, `${f.id}: component missing name`);
      assert.ok(c.resolution && c.resolution.length, `${f.id}: component "${c.name}" missing resolution`);
    }
  }
});

test("COHERENCE: every food declares at least one outcome", () => {
  for (const f of FOODS) {
    assert.ok(Array.isArray(f.outcomes) && f.outcomes.length >= 1, `${f.id}: no outcomes`);
  }
});

test("neutral lean is coherent: only neutral foods lean, and it matches the estimate", () => {
  for (const f of FOODS) {
    const e = ASSESSMENTS[f.id].evidence;
    const lean = S.leanOf(e);
    if (f.effect !== "neutral") {
      assert.equal(lean, null, `${f.id}: directional food should not carry a lean`);
      continue;
    }
    if (lean) {
      // a lean must agree with the point estimate and require a non-trivial size
      if (lean === "positive") assert.ok(e.pooledRR < 1, `${f.id}: leans good but RR>=1`);
      if (lean === "negative") assert.ok(e.pooledRR > 1, `${f.id}: leans bad but RR<=1`);
      assert.ok(Math.abs(Math.log(e.pooledRR)) > 0.03, `${f.id}: lean on a within-floor estimate`);
    }
  }
});

test("researchedOn (where present) is a valid ISO date and maps to a real food", () => {
  for (const f of FOODS) {
    if (f.researchedOn == null) continue;
    assert.match(f.researchedOn, /^\d{4}-\d{2}-\d{2}$/, `${f.id}: bad researchedOn ${f.researchedOn}`);
  }
  for (const id of Object.keys(RESEARCHED_ON || {})) {
    assert.ok(FOODS.some((f) => f.id === id), `RESEARCHED_ON has unknown food: ${id}`);
  }
});

test("contested flag (where present) is a non-empty string on a real food", () => {
  let n = 0;
  for (const f of FOODS) {
    if (f.contested == null) continue;
    n++;
    assert.equal(typeof f.contested, "string", `${f.id}: contested must be a string`);
    assert.ok(f.contested.trim().length > 20, `${f.id}: contested note too short`);
  }
  assert.ok(n >= 1, "expected at least one contested food");
});

test("holding list is well-formed and doesn't duplicate a real food", () => {
  assert.ok(Array.isArray(HOLDING_LIST) && HOLDING_LIST.length, "HOLDING_LIST must be a non-empty array");
  const foodNames = new Set(FOODS.map((f) => f.name.toLowerCase()));
  for (const h of HOLDING_LIST) {
    assert.ok(h.name && h.name.length, "holding item missing name");
    assert.ok(["thin", "unresearched"].includes(h.reason), `holding "${h.name}": bad reason ${h.reason}`);
    assert.ok(h.note && h.note.length, `holding "${h.name}": missing note`);
    assert.ok(!foodNames.has(h.name.toLowerCase()), `holding "${h.name}" duplicates a real food item`);
  }
});

test("every food records a valid categoryUniformity, evenly applied", () => {
  // Applied to EVERY item against one fixed question — not hand-picked. A "not all"
  // note is only meaningful (and only present) on genuinely `mixed` entries.
  const ok = ["specific", "uniform", "mixed"];
  for (const f of FOODS) {
    assert.ok(ok.includes(f.categoryUniformity), `${f.id}: bad categoryUniformity ${f.categoryUniformity}`);
    if (f.categoryUniformity === "mixed") {
      assert.ok(f.uniformityNote && f.uniformityNote.length, `${f.id}: mixed entry needs a uniformityNote`);
    } else {
      assert.ok(!f.uniformityNote, `${f.id}: non-mixed entry must not carry a uniformityNote`);
    }
  }
  // every declared note maps to a real, mixed food
  for (const id of Object.keys(UNIFORMITY_NOTE || {})) {
    const f = FOODS.find((x) => x.id === id);
    assert.ok(f, `uniformityNote for unknown food: ${id}`);
    assert.equal(f.categoryUniformity, "mixed", `uniformityNote on non-mixed food: ${id}`);
  }
});

test("CHAMPION is reproducible and never a 'not all' entry", () => {
  // The ★ top pick per direction = the qualifying (gold/bin) food with the largest
  // headline |ln(pooledRR)|, restricted to specific/uniform. Mirrors app.js.
  const certaintyOf = (f) => S.assess(ASSESSMENTS[f.id].evidence, f.outcomes).tier;
  const magOf = (f) => {
    const a = ASSESSMENTS[f.id];
    const entries = [{ ev: a.evidence, outcomes: f.outcomes }];
    (a.outcomeVerdicts || []).forEach((ov) => entries.push({ ev: ov.evidence, outcomes: [ov.outcome] }));
    return S.maxMagnitude(entries);
  };
  const tagOf = (f) => S.standout(f.effect, certaintyOf(f), magOf(f));
  const lnRR = (f) => Math.abs(Math.log(ASSESSMENTS[f.id].evidence.pooledRR));
  const champ = (tag) => {
    const e = FOODS.filter((f) => tagOf(f) === tag && f.categoryUniformity !== "mixed");
    e.sort((a, b) => lnRR(b) - lnRR(a));
    return e[0];
  };
  const gc = champ("gold"), bc = champ("bin");
  assert.ok(gc && gc.categoryUniformity !== "mixed", "gold champion must be specific/uniform");
  assert.ok(bc && bc.categoryUniformity !== "mixed", "bin champion must be specific/uniform");
  // sanity against the intended calibration (nuts / trans fat)
  assert.equal(gc.id, "tree-nuts");
  assert.equal(bc.id, "trans-fat");
});

test("bump retired: vegetables stay off the RELATIVE-effect shortlist (honest, BoP-consistent)", () => {
  // With the all-cause bump retired (v0.41), magnitude is pure relative effect.
  // Vegetables/fruit are MODERATE on relative effect even at high intake (~0.82-0.85),
  // so they no longer reach Gold or its cusp — which matches rigorous practice
  // (Burden of Proof rates veg->IHD only 2 stars). They win on ABSOLUTE population
  // burden (a separate axis), not relative effect. This is a deliberate outcome, not
  // a regression: the test locks in that the shortlist is not inflated by the bump.
  const certaintyOf = (f) => S.assess(ASSESSMENTS[f.id].evidence, f.outcomes).tier;
  const magOf = (f) => S.maxMagnitude([{ ev: ASSESSMENTS[f.id].evidence, outcomes: f.outcomes }]);
  const veg = FOODS.filter((f) => f.category === "Vegetables");
  const reaching = veg.filter((f) => {
    const s = S.standout(f.effect, certaintyOf(f), magOf(f));
    return s === "gold" || s === "marginal-gold";
  });
  assert.equal(reaching.length, 0, "no vegetable should reach Gold/cusp on relative effect once the bump is retired");
  // Sanity: the shortlist still crowns a genuine large-effect contender.
  const nuts = FOODS.find((f) => f.id === "tree-nuts");
  assert.equal(S.standout("positive", certaintyOf(nuts), magOf(nuts)), "gold");
});

test("directionality is consistent with the verdict (CI excludes null AND effect > floor)", () => {
  // A positive/negative verdict must rest on a directional interval (excludes null
  // AND the effect clears the trivially-small floor). A neutral verdict must not.
  for (const f of FOODS) {
    const e = ASSESSMENTS[f.id].evidence;
    if (f.effect === "neutral") {
      assert.ok(!S.isDirectional(e), `${f.id}: neutral but evidence is directional by rule`);
    } else {
      assert.ok(S.isDirectional(e), `${f.id}: directional but evidence isn't (CI crosses null or effect below floor)`);
    }
  }
});
