"""
covers: Shared pytest fixtures for static, no-network backend contract tests.
does_not_cover: Runtime servers, Deno execution, browser automation, database access, or network calls.
prerequisites: Run from the repository root after installing tests/requirements-test.txt.
"""

from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


@pytest.fixture()
def read_source(repo_root: Path):
    def _read(relative_path: str) -> str:
        path = repo_root / relative_path
        assert path.exists(), f"Expected source file to exist: {relative_path}"
        return path.read_text(encoding="utf-8")

    return _read


@pytest.fixture()
def expect_snippets():
    def _expect(text: str, snippets: list[str]) -> None:
        missing = [snippet for snippet in snippets if snippet not in text]
        assert not missing, "Missing expected source snippets:\n" + "\n".join(missing)

    return _expect
