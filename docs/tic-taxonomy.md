# TIC taxonomy v1.0.0

The authoritative machine-readable vocabulary is
`dataset/tic-taxonomy.json`. Every ARCTIC-0 task has exactly one difficulty tag
(`easy`, `medium`, `hard`, or `expert`) and one or more semantic tags.

Semantic tags describe transformations or inductive demands visible to a
sample-blind builder. They are labels, not natural-language solutions. New tags
require a taxonomy version change, documentation, and validator updates.

The v1.0.0 migration canonicalized spelling and equivalent grammatical forms:
`simmetry`→`symmetry`, `dublicate`→`duplicate`, `unsymmetric`→`asymmetry`, and
several verb/gerund or singular/plural aliases. The former `test` tag on
`Zeros-only` was replaced with the `easy` difficulty tag.
