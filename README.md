# ARCTIC-0

**ARCTIC** is a sample-blind benchmark for evaluating whether frontier AI
systems can autonomously transfer their capabilities into compact models that
generalize to unseen tasks.

This repository is the stable **ARCTIC-0 archive/tooling v1.0.0 release**: the task archive, the
task schema, the **Transfer & Induction Core** (TIC) taxonomy, the task-authoring
editor, and the tag-analysis notebook.

> **Release scope:** v1.0.0 covers the public ARCTIC-0 archive, schemas, taxonomy,
> validation tooling, task editor, and analysis notebook. The evaluator,
> sample-blind feedback service, hosted runtime, and public leaderboard are
> separate roadmap deliverables and are not part of this release.

## Working on OpenSiro?

Repository-local ARCTIC work stays here.

For contributor roles, authority, escalation, cross-repository coordination, or organizational evolution across public OpenSiro projects, start at [`opensiro/vsm-oss-organization/CONTRIBUTOR_START.md`](https://github.com/opensiro/vsm-oss-organization/blob/main/CONTRIBUTOR_START.md).

ARCTIC remains a separate research track. Routing organization-wide questions through that entry point does not make ARCTIC part of the VSM Harness Index or its bounded operational S1 plane.

## What ARCTIC evaluates

Most existing benchmarks evaluate a frontier model directly, which makes model
scale, inference-time compute, task exposure, and the evaluated capability hard
to separate. ARCTIC changes the object of evaluation:

- The **frontier system acts as an autonomous model builder.**
- A **standardized small student model is the actual test-taker.**
- Benchmark execution happens inside a **sealed evaluator.**

The frontier builder may design architectures, synthetic curricula, training
procedures, tools, memory mechanisms, and iterative improvements. Distillation is
one possible method, alongside synthetic-data generation, architecture search,
and autonomous training-pipeline design.

### Sample-blind protocol

The builder **never receives** raw benchmark samples, grids, demonstrations,
target outputs, or per-task traces. It receives only:

- predefined **semantic tags** describing task categories,
- **resource constraints**, and
- controlled **aggregate results** from its student models.

This tests whether a frontier system transfers general inductive biases and
reasoning strategies rather than directly imitating or solving the evaluation
tasks.

### Scope

ARCTIC initially focuses on **ARC-AGI-2-level static abstraction tasks**. This
fills a complementary gap created by the transition to ARC-AGI-3, whose primary
evaluation now uses protected interactive environments. ARCTIC provides an
accessible, reproducible environment for developing compact autonomous reasoners
while preserving a strict separation between the frontier builder and the task
samples.

A key downstream validation is whether an ARCTIC-built student **transfers to
fully private evaluations such as ARC-AGI-3**. In that setting the builder never
accesses the private environments; the student and its training pipeline are
frozen before evaluation, and only the student interacts with the hidden
environment through the standard interface. Success would indicate that useful
exploration, abstraction, planning, memory, and adaptation were *transferred from
the frontier teacher* rather than learned through private-task exposure.

## Examples

Sample tasks from the ARCTIC-0 archive (input → output):

<p>
  <img src="png/0xfbd62cd.png" width="240" alt="ARCTIC-0 example task">
  &nbsp;&nbsp;
  <img src="png/0xac284ba.png" width="200" alt="ARCTIC-0 example task">
</p>

## Repository structure

```
.
├── arc-task-editor.html              # Single-file browser tool to author/edit ARC tasks
├── dataset/
│   ├── arctic-0-85-1.0.0.json        # Public archive: train pairs and test inputs
│   ├── arctic-0-85-1.0.0_test.json   # Reference test outputs (answer key)
│   ├── tic-taxonomy.json              # Controlled TIC tag vocabulary and v0.x aliases
│   └── LICENSE                        # Dataset license (CC BY 4.0)
├── schemas/                           # JSON Schema contracts for both JSON artifacts
├── scripts/                           # Release, notebook, and checksum validation
├── tests/                             # Dataset and editor-import regression tests
├── png/                              # Sample task visualizations
└── tags_analysis.ipynb               # Notebook analysing the TIC tag taxonomy / difficulty distribution
```

## Dataset

The archive is distributed as JSON. Each task is a set of input/output grid pairs
using the standard ARC 10-color palette (`0`–`9`).

### Archive — `dataset/arctic-0-85-1.0.0.json`

Top-level object:

| Field        | Type     | Description                                            |
|--------------|----------|--------------------------------------------------------|
| `schemaVersion` | string | JSON contract version (`"1.0.0"`).                    |
| `datasetVersion` | string | ARCTIC-0 content version (`"1.0.0"`).                 |
| `exportDate` | string   | ISO-8601 export timestamp.                             |
| `maintainer` | object   | Release maintainer name and email.                     |
| `tasks`      | array    | List of 85 task objects (schema below).                |

Each task object:

| Field                | Type    | Description                                                       |
|----------------------|---------|-------------------------------------------------------------------|
| `id`                 | string  | Unique task identifier.                                           |
| `name`               | string  | Human-readable task name.                                         |
| `description`        | string  | Free-form task description.                                       |
| `tags`               | array   | TIC skill + difficulty labels (e.g. `predict`, `torus`, `easy`).  |
| `examples.train`     | array   | Training pairs with visible `input` and `output` grids.           |
| `examples.test`      | array   | Test inputs only. Targets are excluded from the public archive.   |
| `currentTrainExample`| integer | Last-edited train index (editor bookkeeping).                     |
| `currentTestExample` | integer | Last-edited test index (editor bookkeeping).                      |

Train examples are `{ "input": [[int,...],...], "output": [[int,...],...] }`.
Public test examples are `{ "input": [[int,...],...] }`; their targets live only
in the separate answer key. Every grid is rectangular, at most 100×100, and each
cell is an integer `0`–`9` representing an ARC color.

The `tags` field encodes the **Transfer & Induction Core** taxonomy — the same
semantic tags a builder would receive under the sample-blind protocol.

### Reference outputs — `dataset/arctic-0-85-1.0.0_test.json`

The `answers` field maps task `id` → reference test outputs for scoring model predictions:

```json
{
  "schemaVersion": "1.0.0",
  "datasetVersion": "1.0.0",
  "answers": {
    "<taskId>": {
      "taskName": "Task Name",
      "testOutputs": [{ "exampleIndex": 0, "output": [[...]] }]
    }
  }
}
```

### Statistics

| Metric                      | Value |
|-----------------------------|-------|
| Tasks                       | 85    |
| Unique tags                 | 79    |
| Training examples (total)   | 211   |
| Test examples (total)       | 85    |
| Avg. training pairs/task    | 2.48  |
| Avg. test pairs/task        | 1.00  |

Difficulty distribution (by tag):

| Difficulty | Tasks |
|------------|-------|
| easy       | 54    |
| medium     | 23    |
| hard       | 7     |
| expert     | 1     |

## Task editor

`arc-task-editor.html` is a dependency-free, single-page tool for creating and
editing ARC tasks in a browser. Just open the file — no build step or server
required. It is the authoring tool used to build the ARCTIC-0 archive.

Features:

- Create tasks with multiple train/test examples (input + output grids).
- Click-and-drag painting with the 10-color ARC palette.
- Arbitrary grid resizing (`WxH`, up to 100×100).
- Copy/paste and input→output duplication.
- Tags, descriptions, and task search.
- Import/export tasks and test outputs as JSON.
- Auto-save to the browser's `localStorage`.

Keyboard shortcuts (press `?` in the app for the full list):

| Shortcut           | Action                                  |
|--------------------|-----------------------------------------|
| `0`–`9`            | Select color from palette               |
| Drag               | Paint cells with the selected color     |
| `Alt` + size       | Resize input and output grids           |
| `Ctrl`/`Cmd` + `Q` | Resize input grid only                  |
| `Ctrl`/`Cmd` + `A` | Resize output grid only                 |
| `Ctrl`/`Cmd` + `D` | Duplicate input → output                |
| `Ctrl`/`Cmd` + `C` | Copy current grid                       |
| `Ctrl`/`Cmd` + `V` | Paste grid                              |
| `?`                | Show keyboard-shortcut help             |

## Analysis notebook

`tags_analysis.ipynb` loads `dataset/arctic-0-85-1.0.0.json` and produces a
summary of the TIC tag frequencies and the difficulty distribution (bar charts
via matplotlib/seaborn). The tested dependencies are pinned in `requirements.txt`:

```bash
python -m pip install -r requirements.txt
python scripts/run_notebook.py tags_analysis.ipynb
```

To explore it interactively, open the same file with any Jupyter-compatible UI.

## Loading the dataset

```python
import json

with open("dataset/arctic-0-85-1.0.0.json") as f:
    data = json.load(f)

for task in data["tasks"]:
    print(task["name"], task["tags"])
    for pair in task["examples"]["train"]:
        inp, out = pair["input"], pair["output"]
        # ...your student model...
```

## Validation

Node.js 22+ and Python 3.11+ are used by CI. Run the same release gate locally:

```bash
npm test
python -m pip install -r requirements.txt
python scripts/validate_schemas.py
python scripts/run_notebook.py tags_analysis.ipynb
node scripts/verify-checksums.mjs
```

The validator checks task IDs and names, controlled tags, difficulty coverage,
grid shape and color range, archive/answer-key correspondence, release metrics,
editor JavaScript syntax, schemas, and release metadata.

## Versioning

ARCTIC-0 uses semantic versions for both data and schemas. `datasetVersion`
changes when task content or taxonomy changes. `schemaVersion` changes when the
JSON contract changes. The v1.0.0 files are immutable release artifacts; future
versions will use new filenames.

See [CHANGELOG.md](./CHANGELOG.md), [RELEASE.md](./RELEASE.md), and the machine-readable
[CITATION.cff](./CITATION.cff).

## Roadmap beyond archive/tooling v1.0.0

The full ARCTIC release will open-source the evaluator, sample-blind feedback
protocol, mathematical specification, validated task taxonomy, baseline suite,
hosted runtime, submission API, and public leaderboard. Opensiro will host a
runtime where users can submit model-building agents, execute controlled
evaluations, and publish reproducible results.

Success is measured through hidden-task accuracy, improvement across autonomous
development cycles, student-model size and efficiency, transfer per token and
unit of compute, generalization across semantic tags, resistance to adaptive
overfitting, reproducibility, and external transfer to independently maintained
private benchmarks.

This repository currently provides the **ARCTIC-0 archive, task schema, TIC
taxonomy, task editor, and taxonomy analysis**.

## License

- **Code** (`arc-task-editor.html`): [MIT License](./LICENSE).
- **Dataset** (`dataset/`): [CC BY 4.0](./dataset/LICENSE).

By using this dataset you agree to the applicable license terms. If you use
ARCTIC in your work, please cite this repository.

## Citation

```bibtex
@misc{arctic0,
  title  = {ARCTIC: Open Benchmark and Public Runtime for Transfer \& Induction},
  author = {Alexander Zhdanov (xLagerFeuer) and Artem-Darius Weber and Egor Kolychev and
            Artem Ligostaev and Veronika Rastorgueva and
            Prutskii, Alekseii Sergeevich},
  year   = {2026},
  note   = {ARCTIC-0 archive, task schema, and task editor, version 1.0.0},
  url    = {https://github.com/opensiro/arctic-0}
}
```

Maintainer: **xLagerFeuer** — `alexander.zhdanoff@gmail.com`.
