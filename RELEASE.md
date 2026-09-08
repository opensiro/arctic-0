# ARCTIC-0 archive/tooling v1.0.0

Release date: 2026-09-08  
Maintainer: xLagerFeuer <alexander.zhdanoff@gmail.com>

## Scope

This stable release contains the 85-task public archive, separate reference
answer key, TIC taxonomy, JSON schemas, standalone browser editor, analysis
notebook, validation tests, and reproducibility metadata.

The sealed evaluator, feedback service, hosted runtime, submission API, baseline
suite, and leaderboard are not included. They remain separate roadmap items.

## Release facts

- 85 tasks
- 211 train examples
- 85 test inputs and 85 separately stored reference outputs
- 79 controlled tags
- Difficulty distribution: 54 easy, 23 medium, 7 hard, 1 expert
- Grid colors restricted to integers 0–9
- Maximum grid dimensions: 100×100 by contract

## Verification

Run `npm test`, `python scripts/run_notebook.py tags_analysis.ipynb`, and
`node scripts/verify-checksums.mjs`. See `CHECKSUMS.sha256` for artifact digests.

After review, commit these artifacts using xLagerFeuer
<alexander.zhdanoff@gmail.com> as the author and create the signed annotated tag
`v1.0.0` from that commit.
