"""Export page dates and contributor names for the documentation site"""

from __future__ import annotations

import json
from pathlib import Path
import re
import subprocess

# Separate commit fields and trailers without treating spaces in names as delimiters
FIELD_SEPARATOR = "\x1f"
TRAILER_SEPARATOR = "\x1e"
HISTORY_FORMAT = "%ct%x1f%aN%x1f%aE%x1f%cN%x1f%cE%x1f%(trailers:key=Co-authored-by,valueonly,separator=%x1e)"
PAGE_EXTENSIONS = {".md", ".mdx", ".js", ".jsx", ".ts", ".tsx"}
IDENTITY_PATTERN = re.compile(r"^(.+?)\s*<([^<>]+)>$")


def run_git(site_dir: Path, *args: str, input_text: str | None = None) -> str:
    """Run Git in the documentation repository and preserve command failures"""
    return subprocess.check_output(
        ["git", "-c", "log.showSignature=false", "-C", str(site_dir), *args],
        input=input_text,
        text=True,
    )


def write_json(output: Path, value: dict) -> None:
    """Write generated metadata only when its content changes"""
    content = json.dumps(value, indent=2, sort_keys=True) + "\n"
    output.parent.mkdir(exist_ok=True)
    if not output.exists() or output.read_text() != content:
        output.write_text(content)


def read_page_history(site_dir: Path, filename: str) -> tuple[int | None, list[str]]:
    """Follow a page through renames and collect canonical authors, committers, and coauthors"""
    history = run_git(site_dir, "log", "-z", "--follow", f"--format={HISTORY_FORMAT}", "--", filename)
    authors = {}
    timestamp = None
    for record in history.split("\0"):
        if not record:
            continue
        committed_at, name, email, committer_name, committer_email, trailers = record.split(FIELD_SEPARATOR, 5)
        if timestamp is None:
            timestamp = int(committed_at) * 1000
        authors.setdefault(email.casefold(), name)
        authors.setdefault(committer_email.casefold(), committer_name)
        for trailer in trailers.split(TRAILER_SEPARATOR):
            identity = trailer.strip()
            if not IDENTITY_PATTERN.fullmatch(identity):
                continue
            canonical = run_git(site_dir, "check-mailmap", "--stdin", input_text=identity + "\n").strip()
            match = IDENTITY_PATTERN.fullmatch(canonical)
            if match:
                coauthor_name, coauthor_email = match.groups()
                authors.setdefault(coauthor_email.casefold(), coauthor_name.strip())

    # Emails are used only for deduplication and never leave the build process
    names = sorted(set(authors.values()), key=lambda name: (name.casefold(), name))
    return timestamp, names


def export_page_history(site_dir: Path) -> None:
    """Write committed dates and display names without publishing emails or commit bodies"""
    if run_git(site_dir, "rev-parse", "--is-shallow-repository").strip() == "true":
        raise SystemExit("Page history requires full Git history. Fetch the complete history before building.")

    page_dates = {}
    page_contributors = {}
    has_history = bool(run_git(site_dir, "rev-list", "--all", "--max-count=1").strip())
    filenames = run_git(site_dir, "ls-files", "-z", "--", "docs", "src/pages").split("\0")
    for filename in filenames:
        page = site_dir / filename
        if not has_history or not page.is_file() or page.suffix not in PAGE_EXTENSIONS:
            continue
        timestamp, names = read_page_history(site_dir, filename)
        if timestamp is not None:
            page_dates[filename] = timestamp
        if names and filename.startswith("docs/"):
            page_contributors[filename] = names

    output_dir = site_dir / ".page-history"
    write_json(output_dir / "last-updated.json", page_dates)
    write_json(output_dir / "contributors.json", page_contributors)


if __name__ == "__main__":
    export_page_history(Path(__file__).resolve().parents[1])
