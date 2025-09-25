# Release Workflow

This document explains how to release new versions of Lithia.

## Versioning

We use [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes (backward compatible)

## Release Commands

```bash
# Patch release (bug fixes)
npm run version:patch

# Minor release (new features)
npm run version:minor

# Major release (breaking changes)
npm run version:major

# Publish to npm
npm run release
```

## Manual Workflow

1. **Make your changes** and test them
2. **Update CHANGELOG.md** with your changes
3. **Run version command** (e.g., `npm run version:patch`)
4. **Review the changes** in git
5. **Push to repository** with tags: `git push && git push --tags`
6. **GitHub Actions will automatically** build and publish to npm

## Example

```bash
# 1. Make changes and test
npm run build
npm run examples run --project 1-basic-api

# 2. Update CHANGELOG.md
# Add your changes to the [Unreleased] section

# 3. Create new version
npm run version:patch

# 4. Push with tags (GitHub Actions will publish automatically)
git push && git push --tags
```

## Changelog Format

Follow the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

### Added

- New feature description

### Changed

- Changed behavior description

### Fixed

- Bug fix description

### Removed

- Removed feature description
```
