# Changelog

All notable changes to ARCTIC-0 archive/tooling are documented here. The project
uses Semantic Versioning for `datasetVersion` and `schemaVersion` independently.

## 1.0.0 — 2026-09-08

- Declared the first stable release scope: archive, schemas, taxonomy, validator,
  editor, and analysis notebook.
- Separated `datasetVersion` from `schemaVersion`.
- Added JSON Schema contracts and an envelope for reference answers.
- Made the public archive contract explicit: test targets are excluded.
- Normalized TIC aliases and spelling; added one difficulty tag per task.
- Added non-empty task descriptions and unique task names.
- Added release validation, editor regression tests, CI, and checksums.
- Made the analysis notebook deterministic and pinned its dependencies.
- Added dataset licensing, citation metadata, security policy, and contribution guidance.

## 0.7.0 — 2026-09-07

- Redesigned Pattern recovery examples.

## 0.6.2 — 2026-07-28

- Updated the public dataset and notebook path.

## 0.6.0 — 2026-07-28

- Initial public archive of 85 tasks, reference outputs, editor, and notebook.
