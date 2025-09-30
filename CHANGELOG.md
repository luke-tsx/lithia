# Changelog

All notable changes to Lithia will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note:** All versions prior to 4.0.1 were released for testing purposes and should not be used in production.

## [4.0.3] - 2025-01-27

### 🚀 Performance Improvements

- **Massive Build Performance Boost**: Achieved 97.8% improvement in build times (from ~360ms to ~8ms)
- **Native SWC Path Resolution**: Implemented native TypeScript path mapping support in SWC, eliminating the need for `tsc-alias`
- **Dynamic tsconfig.json Reading**: Added automatic reading of TypeScript path mappings from `tsconfig.json` for maximum flexibility
- **Intelligent Caching System**: Enhanced caching with timestamp-based file tracking and persistent cache storage
- **Parallel Execution Optimization**: Fixed race conditions in parallel route building for consistent performance

### 🔧 Technical Improvements

- **Removed tsc-alias Dependency**: Completely eliminated `tsc-alias` as SWC now handles path resolution natively
- **Optimized Build Pipeline**: Streamlined build process with better error handling and cleaner logs
- **Enhanced File Watching**: Improved incremental compilation for faster development cycles
- **Memory Optimization**: Reduced memory footprint during builds with better resource management

### 🐛 Bug Fixes

- **Fixed Duplicate Logs**: Resolved issue where build performance logs were appearing multiple times
- **Consistent Timing**: Unified build timing measurements across different build components
- **ESLint Warnings**: Cleaned up all unused variable warnings in build system
- **Race Condition Fix**: Fixed parallel execution issues that caused inconsistent build results

### 📦 Dependencies

- **Removed**: `tsc-alias` (no longer needed with native SWC path resolution)
- **Optimized**: Build system dependencies for better performance

### 💡 Developer Experience

- **Cleaner Console Output**: Simplified build logs showing only essential information
- **Better Error Messages**: Improved error reporting for build failures
- **Faster Development**: Significantly reduced build times for better development experience

## [4.0.1] - 2025-09-29

### ⚠️ Breaking Changes

- **Routing Convention Changed**: Routes are now defined using `route.ts` files instead of the previous convention. You'll need to migrate your existing routes to the new format.
  - **Migration Guide**: Rename your route files to follow the new pattern:
    - `index.ts` → `route.ts`
    - `users.get.ts` → `users/route.get.ts`

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