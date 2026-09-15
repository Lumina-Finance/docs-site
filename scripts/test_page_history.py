"""Exercise the metadata exporter against real temporary Git repositories"""

import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

EXPORTER = Path(__file__).with_name("page-history.py")


class PageHistoryTests(unittest.TestCase):
    """Keep attribution tied to committed page history without leaking identities"""

    def setUp(self):
        """Create an isolated repository with the exporter's real command entry point"""
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name) / "site"
        self.repo.mkdir()
        self.env = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
        self.env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
        self.git("init", "-q")
        self.git("config", "user.name", "Alice")
        self.git("config", "user.email", "alice@example.invalid")
        (self.repo / "scripts").mkdir()
        shutil.copy2(EXPORTER, self.repo / "scripts/page-history.py")
        (self.repo / "docs").mkdir()

    def git(self, *args):
        """Run a fixture command without inheriting the real repository's Git paths"""
        return subprocess.check_output(["git", "-C", str(self.repo), *args], env=self.env, text=True)

    def commit(self, message, author="Alice <alice@example.invalid>"):
        """Commit fixture changes with deterministic contributor identities"""
        self.git("commit", "-q", "--no-gpg-sign", f"--author={author}", "-m", message)

    def export(self, repo=None):
        """Run the same script entry point used by start and build"""
        directory = repo or self.repo
        return subprocess.run([sys.executable, str(directory / "scripts/page-history.py")],
                              env=self.env, text=True, capture_output=True)

    def metadata(self, filename):
        """Read one generated JSON payload"""
        return json.loads((self.repo / ".page-history" / filename).read_text())

    def test_renames_coauthors_mailmap_and_dates(self):
        """Credit all page authors across a rename while keeping private emails out"""
        page = self.repo / "docs/old.md"
        page.write_text("# A page\n")
        self.git("add", "docs/old.md", "scripts/page-history.py")
        self.commit("Add page\n\nCo-authored-by: Old Bob <bob.old@example.invalid>")
        self.git("mv", "docs/old.md", "docs/new.md")
        self.commit("Rename page", "Carol <carol@example.invalid>")
        (self.repo / "docs/new.md").write_text("# A page\n\nMore detail\n")
        self.git("add", "docs/new.md")
        self.commit("Expand page\n\nCo-authored-by: Alice <alice@example.invalid>")
        (self.repo / ".mailmap").write_text("Bob <bob@example.invalid> Old Bob <bob.old@example.invalid>\n")
        self.git("add", ".mailmap")
        self.commit("Map identity")
        expected_date = int(self.git("log", "-1", "--format=%ct", "--", "docs/new.md").strip()) * 1000
        result = self.export()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.metadata("contributors.json"), {"docs/new.md": ["Alice", "Bob", "Carol"]})
        self.assertEqual(self.metadata("last-updated.json"), {"docs/new.md": expected_date})
        self.assertNotIn("@", (self.repo / ".page-history/contributors.json").read_text())
        self.assertNotIn("Co-authored-by", (self.repo / ".page-history/contributors.json").read_text())
        output = self.repo / ".page-history/contributors.json"
        modified = output.stat().st_mtime_ns
        self.assertEqual(self.export().returncode, 0)
        self.assertEqual(output.stat().st_mtime_ns, modified)

    def test_distinct_committers_are_credited_alongside_authors(self):
        """Include people who committed a page change even when someone else authored it"""
        (self.repo / "docs/page.md").write_text("# Page\n")
        self.git("add", "docs/page.md")
        self.commit("Add page", "Writer <writer@example.invalid>")
        self.git("config", "user.name", "Maintainer")
        self.git("config", "user.email", "maintainer@example.invalid")
        (self.repo / "docs/page.md").write_text("# Page\n\nMore detail\n")
        self.git("add", "docs/page.md")
        self.commit("Revise page", "Writer <writer@example.invalid>")
        result = self.export()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.metadata("contributors.json"),
                         {"docs/page.md": ["Alice", "Maintainer", "Writer"]})

    def test_uncommitted_pages_have_no_invented_author(self):
        """Ignore untracked and staged-only content while preserving committed authors"""
        page = self.repo / "docs/existing.md"
        page.write_text("# Existing\n")
        self.git("add", "docs/existing.md")
        self.commit("Add existing")
        page.write_text("# Changed but not committed\n")
        (self.repo / "docs/untracked.md").write_text("# Untracked\n")
        (self.repo / "docs/staged.md").write_text("# Staged\n")
        self.git("add", "docs/staged.md")
        result = self.export()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.metadata("contributors.json"), {"docs/existing.md": ["Alice"]})

    def test_repository_without_commits_exports_empty_metadata(self):
        """Allow a new checkout to preview manual acknowledgements before its first commit"""
        result = self.export()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.metadata("contributors.json"), {})
        self.assertEqual(self.metadata("last-updated.json"), {})

    def test_shallow_history_fails_clearly(self):
        """Reject an incomplete history instead of silently omitting contributors"""
        self.git("add", "scripts/page-history.py")
        self.commit("Add exporter")
        clone = Path(self.temp.name) / "shallow"
        subprocess.check_call(["git", "clone", "-q", "--depth=1", self.repo.as_uri(), str(clone)], env=self.env)
        result = self.export(clone)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("full Git history", result.stderr)
        self.assertFalse((clone / ".page-history/contributors.json").exists())


if __name__ == "__main__":
    unittest.main()
