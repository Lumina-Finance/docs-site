"""Export page commit dates for the documentation site"""

import json
from pathlib import Path
import subprocess


def export_page_history(site_dir: Path) -> None:
    """Write committed page timestamps without exposing repository history or authors"""
    def git(*args: str) -> str:
        """Run Git in the documentation directory and preserve command failures"""
        return subprocess.check_output(
            ["git", "-c", "log.showSignature=false", "-C", str(site_dir), *args], text=True
        )

    if git("rev-parse", "--is-shallow-repository").strip() == "true":
        raise SystemExit("Page dates require full Git history. Fetch the complete history before building.")

    page_dates = {}
    for filename in git("ls-files", "-z", "--", "docs", "src/pages").split("\0"):
        page = site_dir / filename
        if not page.is_file() or page.suffix not in {".md", ".mdx", ".js", ".jsx", ".ts", ".tsx"}:
            continue
        timestamp = git("log", "-1", "--follow", "--format=%ct", "--", filename).strip()
        if timestamp:
            page_dates[filename] = int(timestamp) * 1000

    output = site_dir / ".page-history" / "last-updated.json"
    content = json.dumps(page_dates, indent=2, sort_keys=True) + "\n"
    output.parent.mkdir(exist_ok=True)
    if not output.exists() or output.read_text() != content:
        output.write_text(content)


if __name__ == "__main__":
    export_page_history(Path(__file__).resolve().parents[1])
