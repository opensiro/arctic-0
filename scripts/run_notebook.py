"""Execute a notebook's code cells without modifying the notebook file."""

# Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import json
import os
import sys
import warnings

os.environ.setdefault("MPLBACKEND", "Agg")
warnings.filterwarnings("ignore", message="Matplotlib is currently using agg")


def main() -> int:
    notebook_path = sys.argv[1] if len(sys.argv) > 1 else "tags_analysis.ipynb"
    with open(notebook_path, encoding="utf-8") as notebook_file:
        notebook = json.load(notebook_file)

    namespace: dict[str, object] = {}
    for index, cell in enumerate(notebook["cells"]):
        if cell["cell_type"] != "code":
            continue
        source = "".join(cell["source"])
        exec(compile(source, f"{notebook_path}:cell-{index}", "exec"), namespace)

    print(f"Notebook execution passed: {notebook_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
