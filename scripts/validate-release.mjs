// Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ARCHIVE_PATH = path.join(ROOT, "dataset", "arctic-0-85-1.0.0.json");
export const ANSWERS_PATH = path.join(ROOT, "dataset", "arctic-0-85-1.0.0_test.json");
export const TAXONOMY_PATH = path.join(ROOT, "dataset", "tic-taxonomy.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

export function validateGrid(grid, location, errors) {
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 100) {
    errors.push(`${location}: grid height must be between 1 and 100`);
    return;
  }
  const width = Array.isArray(grid[0]) ? grid[0].length : 0;
  if (width < 1 || width > 100) {
    errors.push(`${location}: grid width must be between 1 and 100`);
    return;
  }
  grid.forEach((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== width) {
      errors.push(`${location}: row ${rowIndex} is not rectangular`);
      return;
    }
    row.forEach((value, columnIndex) => {
      if (!Number.isInteger(value) || value < 0 || value > 9) {
        errors.push(`${location}: cell ${rowIndex},${columnIndex} is not an integer from 0 to 9`);
      }
    });
  });
}

export function validateRelease({ archive, answerKey, taxonomy }) {
  const errors = [];
  const difficulty = new Set(taxonomy.difficultyTags);
  const allowedTags = new Set([...taxonomy.difficultyTags, ...taxonomy.semanticTags]);
  const ids = new Set();
  const names = new Set();
  let trainExamples = 0;
  let testExamples = 0;

  if (archive.schemaVersion !== "1.0.0" || archive.datasetVersion !== "1.0.0") {
    errors.push("archive: schemaVersion and datasetVersion must both be 1.0.0");
  }
  if (answerKey.schemaVersion !== archive.schemaVersion || answerKey.datasetVersion !== archive.datasetVersion) {
    errors.push("answer key: versions must match the archive");
  }
  if (archive.maintainer?.name !== "xLagerFeuer" || archive.maintainer?.email !== "alexander.zhdanoff@gmail.com") {
    errors.push("archive: maintainer metadata is missing or incorrect");
  }
  if (!Array.isArray(archive.tasks) || archive.tasks.length !== 85) {
    errors.push(`archive: expected 85 tasks, found ${archive.tasks?.length ?? "none"}`);
  }

  for (const [taskIndex, task] of (archive.tasks ?? []).entries()) {
    const location = `tasks[${taskIndex}]`;
    if (typeof task.id !== "string" || !task.id) errors.push(`${location}: missing id`);
    if (ids.has(task.id)) errors.push(`${location}: duplicate id ${task.id}`);
    ids.add(task.id);
    if (typeof task.name !== "string" || !task.name.trim()) errors.push(`${location}: empty name`);
    if (names.has(task.name)) errors.push(`${location}: duplicate name ${task.name}`);
    names.add(task.name);
    if (typeof task.description !== "string" || !task.description.trim()) errors.push(`${location}: empty description`);
    if (!Array.isArray(task.tags) || new Set(task.tags).size !== task.tags.length) {
      errors.push(`${location}: tags must be a unique array`);
    } else {
      const difficultyTags = task.tags.filter((tag) => difficulty.has(tag));
      if (difficultyTags.length !== 1) errors.push(`${location}: expected exactly one difficulty tag`);
      if (!task.tags.some((tag) => !difficulty.has(tag))) errors.push(`${location}: expected at least one semantic tag`);
      for (const tag of task.tags) if (!allowedTags.has(tag)) errors.push(`${location}: unknown tag ${tag}`);
    }

    const train = task.examples?.train;
    const test = task.examples?.test;
    if (!Array.isArray(train) || !train.length) errors.push(`${location}: missing train examples`);
    if (!Array.isArray(test) || !test.length) errors.push(`${location}: missing test examples`);
    for (const [index, example] of (train ?? []).entries()) {
      trainExamples += 1;
      validateGrid(example.input, `${location}.train[${index}].input`, errors);
      validateGrid(example.output, `${location}.train[${index}].output`, errors);
    }
    for (const [index, example] of (test ?? []).entries()) {
      testExamples += 1;
      validateGrid(example.input, `${location}.test[${index}].input`, errors);
      if (Object.hasOwn(example, "output")) errors.push(`${location}.test[${index}]: public archive must not contain output`);
    }
    if (!Number.isInteger(task.currentTrainExample) || task.currentTrainExample < 0 || task.currentTrainExample >= (train?.length ?? 0)) {
      errors.push(`${location}: currentTrainExample is out of range`);
    }
    if (!Number.isInteger(task.currentTestExample) || task.currentTestExample < 0 || task.currentTestExample >= (test?.length ?? 0)) {
      errors.push(`${location}: currentTestExample is out of range`);
    }

    const answers = answerKey.answers?.[task.id];
    if (!answers) {
      errors.push(`${location}: missing answer-key entry`);
      continue;
    }
    if (answers.taskName !== task.name) errors.push(`${location}: answer-key name mismatch`);
    if (!Array.isArray(answers.testOutputs) || answers.testOutputs.length !== (test?.length ?? 0)) {
      errors.push(`${location}: answer-key output count mismatch`);
      continue;
    }
    answers.testOutputs.forEach((answer, index) => {
      if (answer.exampleIndex !== index) errors.push(`${location}: answer index ${index} is inconsistent`);
      validateGrid(answer.output, `${location}.answer[${index}]`, errors);
    });
  }

  for (const id of Object.keys(answerKey.answers ?? {})) {
    if (!ids.has(id)) errors.push(`answer key: orphan task id ${id}`);
  }

  if (trainExamples !== 211) errors.push(`archive: expected 211 train examples, found ${trainExamples}`);
  if (testExamples !== 85) errors.push(`archive: expected 85 test examples, found ${testExamples}`);

  const usedTags = new Set((archive.tasks ?? []).flatMap((task) => task.tags));
  if (usedTags.size !== allowedTags.size || [...usedTags].some((tag) => !allowedTags.has(tag))) {
    errors.push("taxonomy: controlled vocabulary and used tags differ");
  }

  return {
    errors,
    stats: {
      tasks: archive.tasks?.length ?? 0,
      trainExamples,
      testExamples,
      uniqueTags: usedTags.size,
      difficulty: Object.fromEntries([...difficulty].map((tag) => [tag, archive.tasks.filter((task) => task.tags.includes(tag)).length])),
    },
  };
}

export function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function runValidation() {
  const archive = readJson(ARCHIVE_PATH);
  const answerKey = readJson(ANSWERS_PATH);
  const taxonomy = readJson(TAXONOMY_PATH);
  const result = validateRelease({ archive, answerKey, taxonomy });

  for (const schema of ["arctic-archive.schema.json", "arctic-answer-key.schema.json"]) {
    readJson(path.join(ROOT, "schemas", schema));
  }

  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  for (const required of ["arctic-0-85-1.0.0.json", "Tasks                       | 85", "Unique tags                 | 79"]) {
    if (!readme.includes(required)) result.errors.push(`README: missing release fact: ${required}`);
  }

  const editor = fs.readFileSync(path.join(ROOT, "arc-task-editor.html"), "utf8");
  const scripts = [...editor.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) result.errors.push("editor: no JavaScript found");
  scripts.forEach((match, index) => {
    try { new Function(match[1]); } catch (error) { result.errors.push(`editor: script ${index} syntax error: ${error.message}`); }
  });

  if (result.errors.length) {
    console.error(result.errors.map((error) => `ERROR: ${error}`).join("\n"));
    return 1;
  }
  console.log(`ARCTIC-0 v1.0.0 validation passed: ${JSON.stringify(result.stats)}`);
  console.log(`archive sha256: ${sha256(ARCHIVE_PATH)}`);
  console.log(`answer key sha256: ${sha256(ANSWERS_PATH)}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runValidation();
}
