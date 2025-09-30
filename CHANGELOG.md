# Changelog

All notable changes to Lithia will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note:** All versions prior to 4.0.1 were released for testing purposes and should not be used in production.

## [Unreleased]

### Added
- Nothing yet! Check back soon.

## [4.0.1] - 2025-09-29

### ⚠️ Breaking Changes

- **Routing Convention Changed**: Routes are now defined using `route.ts` files instead of the previous convention. You'll need to migrate your existing routes to the new format.
  - **Migration Guide**: Rename your route files to follow the new pattern:
    - `index.ts` → `route.ts`
    - `users.get.ts` → `users/route.get.ts`
  - See [Migration Guide](https://lithiajs.com/docs/migration/3.1) for detailed instructions

### Added

- **Lithia Studio Route Builder**: Create and manage routes directly from the Studio UI with the new visual route builder
- **Improved Studio UI**: Complete redesign of Lithia Studio with better performance and user experience
  - New dashboard with real-time metrics
  - Enhanced route explorer with better visualization
  - Improved logs viewer with filtering and search

### Fixed

- **Hook System**: Fixed hooks not updating correctly when `lithia.config.ts` is modified during development
- **Build Process**: Resolved issues with the build pipeline that caused incomplete builds in certain scenarios
- **Hot Reload**: Fixed edge cases where hot reload wouldn't trigger for nested route files

### Changed

- Updated internal dependencies for better performance and security

---

## How to Read This Changelog

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerabilities fixed
- **⚠️ Breaking Changes**: Changes that require code updates

---

## Links

- [All Releases](https://github.com/lithia-framework/lithia/releases)
- [Documentation](https://lithiajs.com)

---

**Legend:**
- 🎉 Major feature
- ✨ Minor feature  
- 🐛 Bug fix
- ⚠️ Breaking change
- 📝 Documentation
- 🔒 Security fix