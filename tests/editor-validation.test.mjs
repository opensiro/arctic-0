// Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../arc-task-editor.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 2);
new Function(scripts[0][1])();

const { normalizeImportedTasks, validateImportedGrid } = globalThis.ARCTICEditorValidation;
const blank = (rows, columns) => Array.from({ length: rows }, () => Array(columns).fill(0));
const validTask = () => ({
  id: "task-1",
  name: "Example",
  description: "Example task",
  tags: ["easy", "pattern"],
  examples: {
    train: [{ input: [[0]], output: [[1]] }],
    test: [{ input: [[0]] }],
  },
  currentTrainExample: 0,
  currentTestExample: 0,
});

test("editor JavaScript parses without external dependencies", () => {
  for (const source of scripts.map((match) => match[1])) assert.doesNotThrow(() => new Function(source));
});

test("empty imports are rejected", () => {
  assert.throws(() => normalizeImportedTasks([], blank), /at least one task/);
});

test("duplicate task ids are rejected", () => {
  assert.throws(() => normalizeImportedTasks([validTask(), validTask()], blank), /Duplicate task id/);
});

test("malformed grids and colors outside the ARC palette are rejected", () => {
  assert.throws(() => validateImportedGrid([[0, 1], [2]], "grid"), /not rectangular/);
  assert.throws(() => validateImportedGrid([[10]], "grid"), /integer from 0 to 9/);
});

test("public test inputs receive an editable placeholder output", () => {
  const [task] = normalizeImportedTasks([validTask()], blank);
  assert.deepEqual(task.examples.test[0].output, blank(3, 3));
});
