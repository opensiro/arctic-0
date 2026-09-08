// Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  ANSWERS_PATH,
  ARCHIVE_PATH,
  TAXONOMY_PATH,
  validateGrid,
  validateRelease,
} from "../scripts/validate-release.mjs";

const load = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

test("the complete v1.0.0 release is internally consistent", () => {
  const result = validateRelease({
    archive: load(ARCHIVE_PATH),
    answerKey: load(ANSWERS_PATH),
    taxonomy: load(TAXONOMY_PATH),
  });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.stats, {
    tasks: 85,
    trainExamples: 211,
    testExamples: 85,
    uniqueTags: 79,
    difficulty: { easy: 54, medium: 23, hard: 7, expert: 1 },
  });
});

test("grid validation rejects ragged rows and invalid colors", () => {
  const errors = [];
  validateGrid([[0, 1], [2], [10, 0]], "sample", errors);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /not rectangular/);
  assert.match(errors[1], /not an integer/);
});

test("release validation rejects leaked test answers", () => {
  const archive = load(ARCHIVE_PATH);
  archive.tasks[0].examples.test[0].output = [[0]];
  const result = validateRelease({ archive, answerKey: load(ANSWERS_PATH), taxonomy: load(TAXONOMY_PATH) });
  assert(result.errors.some((error) => error.includes("must not contain output")));
});
