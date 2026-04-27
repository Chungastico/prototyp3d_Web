## 2025-02-28 - Package Manager Lockfiles
**Learning:** Running `bun install` to fix local linter/builder issues creates a `bun.lock` file which should not be committed unless explicitly requested, to avoid violating constraints on modifying package configuration.
**Action:** Always verify `git status` after local development commands and remove auto-generated lockfiles or build artifacts (like `public/sitemap.xml`) before submitting changes.
