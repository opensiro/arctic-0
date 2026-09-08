// Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import fs from "node:fs";
import path from "node:path";
import { ROOT, sha256 } from "./validate-release.mjs";

const checksumFile = path.join(ROOT, "CHECKSUMS.sha256");
const lines = fs.readFileSync(checksumFile, "utf8").trim().split(/\r?\n/);
const errors = [];

for (const [index, line] of lines.entries()) {
  const match = line.match(/^([a-f0-9]{64})  (.+)$/);
  if (!match) {
    errors.push(`line ${index + 1}: invalid checksum format`);
    continue;
  }
  const [, expected, relativePath] = match;
  const file = path.resolve(ROOT, relativePath);
  if (!file.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(file)) {
    errors.push(`${relativePath}: missing or outside repository`);
    continue;
  }
  const actual = sha256(file);
  if (actual !== expected) errors.push(`${relativePath}: expected ${expected}, found ${actual}`);
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${lines.length} release artifact checksums`);
}
