// Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import fs from "node:fs";
import path from "node:path";
import { ROOT, sha256 } from "./validate-release.mjs";

const artifacts = [
  "arc-task-editor.html",
  "dataset/arctic-0-85-1.0.0.json",
  "dataset/arctic-0-85-1.0.0_test.json",
  "dataset/tic-taxonomy.json",
  "schemas/arctic-answer-key.schema.json",
  "schemas/arctic-archive.schema.json",
  "tags_analysis.ipynb",
];

const output = artifacts
  .map((artifact) => `${sha256(path.join(ROOT, artifact))}  ${artifact.replaceAll("\\", "/")}`)
  .join("\n");

fs.writeFileSync(path.join(ROOT, "CHECKSUMS.sha256"), `${output}\n`);
console.log(`Wrote ${artifacts.length} checksums to CHECKSUMS.sha256`);
