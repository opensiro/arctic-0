# Contributing

ARCTIC-0 v1.0.0 artifacts are immutable. Changes should target a new dataset or
schema version and include updated schemas, documentation, tests, and checksums.

Maintainer: xLagerFeuer <alexander.zhdanoff@gmail.com>.

## Before opening a pull request

1. Do not add target outputs to the public archive; keep them in the answer key.
2. Use only tags declared in `dataset/tic-taxonomy.json` or propose a taxonomy
   version change with migration notes.
3. Give every task a unique ID, unique name, non-empty description, exactly one
   difficulty tag, at least one train pair, and at least one test input.
4. Keep grids rectangular, no larger than 100×100, with integer colors 0–9.
5. Run `npm test`, execute the notebook, regenerate checksums, and include the
   resulting release facts in the pull request.

Please keep task solutions and unpublished evaluation material out of public
issues and pull requests.
