"""Validate release JSON artifacts and citation metadata."""

# Copyright (c) 2026 xLagerFeuer <alexander.zhdanoff@gmail.com>

import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent


def load_json(relative_path: str) -> object:
    with (ROOT / relative_path).open(encoding="utf-8") as source:
        return json.load(source)


def validate(instance_path: str, schema_path: str) -> None:
    schema = load_json(schema_path)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(load_json(instance_path)), key=lambda error: list(error.path))
    if errors:
        details = "\n".join(f"{list(error.path)}: {error.message}" for error in errors)
        raise ValueError(f"{instance_path} failed schema validation:\n{details}")


def main() -> int:
    validate("dataset/arctic-0-85-1.0.0.json", "schemas/arctic-archive.schema.json")
    validate("dataset/arctic-0-85-1.0.0_test.json", "schemas/arctic-answer-key.schema.json")

    with (ROOT / "CITATION.cff").open(encoding="utf-8") as source:
        citation = yaml.safe_load(source)
    assert citation["version"] == "1.0.0"
    assert citation["contact"][0]["alias"] == "xLagerFeuer"
    assert citation["contact"][0]["email"] == "alexander.zhdanoff@gmail.com"
    print("JSON Schema and citation metadata validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
