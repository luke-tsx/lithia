# Contributing to Lithia

First off, thank you for considering contributing to Lithia! We're building something special here, and we'd love for you to be part of it from the beginning.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by respect, professionalism, and inclusivity. By participating, you are expected to uphold these values. Please report unacceptable behavior to [support@lithiajs.com](mailto:support@lithiajs.com).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/lithia-framework/lithia/issues) to avoid duplicates.

When creating a bug report, include:

- **Clear and descriptive title**
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, Node version, Lithia version)
- **Code samples** or repository links if possible
- **Screenshots** if applicable

**Example:**

```markdown
**Bug**: Hot reload doesn't trigger when modifying middleware files

**Steps to Reproduce:**

1. Start server with `lithia dev`
2. Modify `src/middlewares/auth.ts`
3. Save the file

**Expected:** Server should reload automatically
**Actual:** No reload happens, manual restart required

**Environment:**

- OS: Ubuntu 22.04
- Node: v20.10.0
- Lithia: v3.1.0
```

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/lithia-framework/lithia/issues).

When creating an enhancement suggestion, include:

- **Clear and descriptive title**
- **Detailed description** of the proposed functionality
- **Use cases** and **examples** of how it would be used
- **Possible implementation** approach (optional)
- **Alternatives considered** (if any)

### First-Time Contributors

Look for issues labeled with:

- `good first issue` - Easy issues perfect for newcomers
- `help wanted` - Issues where we need community help
- `documentation` - Documentation improvements

Don't be afraid to ask questions! We're here to help.

## Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **Git**

### Clone and Install

```bash
# Fork the repository on GitHub first, then:

# Clone your fork
git clone https://github.com/your-username/lithia.git
cd lithia

# Add upstream remote
git remote add upstream https://github.com/lithia-framework/lithia.git

# Install dependencies
pnpm install

# Install Studio dependencies
cd studio
pnpm install
cd ..
```

### Build the Project

```bash
# Build Lithia core and Studio
pnpm run build
```

### Run Examples

```bash
# Navigate to an example
cd examples/1-basic-api

# Install dependencies
pnpm install

# Run in development mode
pnpm run dev
```

### Development Workflow

```bash
# Make changes to src/

# Build to test changes
pnpm run build

# Test with examples
cd examples/1-basic-api
pnpm run dev

# Check code quality
pnpm run lint
pnpm run format:check
```

## Pull Request Process

1. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes** thoroughly:

   ```bash
   # Run linter
   pnpm run lint

   # Check formatting
   pnpm run format:check

   # Run type checking
   pnpm run type-check

   # Test with examples
   cd examples/1-basic-api && pnpm run dev
   ```

4. **Commit your changes** following [commit guidelines](#commit-guidelines)

5. **Push to your fork**:

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request** against `main`

7. **Wait for review** - maintainers will review your PR and may request changes

### Pull Request Requirements

- **Clear description** of what the PR does
- **Reference related issues** (e.g., "Fixes #123")
- **All checks passing** (lint, format, type-check)
- **No breaking changes** without discussion (or clearly marked)
- **Updated documentation** if needed

### Pull Request Template

```markdown
## Description

Brief description of what this PR does

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue

Fixes #(issue number)

## How Has This Been Tested?

Describe the tests you ran and how to reproduce them

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested this with the example projects
```

## Coding Standards

### TypeScript

- **Use TypeScript** - No `any` types unless absolutely necessary
- **Strong typing** - Define interfaces for all data structures
- **No implicit any** - Always specify types

**Good:**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  // implementation
}
```

**Bad:**

```typescript
async function getUser(id) {
  // implementation
}
```

### Code Style

We use **ESLint** for linting and **Prettier** for formatting:

```bash
# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Lint
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

### Best Practices

- **No comments in code** - Code should be self-explanatory
- **Descriptive variable names** - Use clear, meaningful names
- **Small functions** - Each function should do one thing well
- **Error handling** - Always handle errors appropriately
- **Async/await** - Use async/await over promises

**Good:**

```typescript
async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await database.users.findById(userId);
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    return null;
  }
}
```

**Bad:**

```typescript
function getUser(id) {
  return db.users
    .find(id)
    .then((u) => u)
    .catch((e) => null);
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **ci**: CI/CD changes

### Examples

```bash
# New feature
git commit -m "feat(routing): add support for catch-all routes"

# Bug fix
git commit -m "fix(hot-reload): correctly detect file changes in nested directories"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(server)!: change default port to 3000

BREAKING CHANGE: The default server port has changed from 8080 to 3000.
Users need to update their configurations or explicitly set the port."

# Multiple changes
git commit -m "chore: update dependencies and fix linting issues"
```

### Scope Guidelines

Common scopes:

- `core` - Core framework functionality
- `routing` - Routing system
- `server` - HTTP server
- `studio` - Lithia Studio
- `cli` - Command-line interface
- `build` - Build system
- `types` - TypeScript types
- `docs` - Documentation
- `examples` - Example projects

## Project Structure

```
lithia/
├── src/                      # Source code
│   ├── cli/                  # CLI commands
│   ├── core/                 # Core framework
│   │   ├── build/           # Build system
│   │   ├── config/          # Configuration
│   │   ├── log/             # Logging
│   │   ├── routing/         # Routing system
│   │   └── server/          # HTTP server
│   ├── studio/              # Lithia Studio
│   └── types/               # TypeScript types
├── studio/                   # Studio UI (Next.js)
├── examples/                 # Example projects
├── dist/                     # Built files
└── build.ts                 # Build script
```

### Key Files

- `src/core/lithia.ts` - Main Lithia instance
- `src/core/routing/convention.ts` - Routing conventions
- `src/core/server/http-server-manager.ts` - HTTP server
- `src/studio/lithia-studio.ts` - Studio server
- `build.ts` - Build pipeline

## Testing

### Manual Testing

We currently rely on manual testing with example projects:

```bash
# Test with basic example
cd examples/1-basic-api
pnpm install
pnpm run dev

# Test features:
# - Create new routes
# - Test hot reload
# - Test Lithia Studio
# - Test different HTTP methods
# - Test dynamic routes
```

### Testing Checklist

Before submitting a PR, test:

- [ ] Hot reload works with file changes
- [ ] New routes are detected automatically
- [ ] Lithia Studio displays correctly
- [ ] CLI commands work (`dev`, `build`, `start`)
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Examples run without issues

## Documentation

### Code Documentation

- **JSDoc for public APIs** - Document all exported functions and classes
- **Type definitions** - Use TypeScript types as documentation
- **Clear naming** - Use self-explanatory names

**Example:**

```typescript
/**
 * Creates a new Lithia instance with the provided configuration.
 *
 * @param config - Lithia configuration object
 * @param opts - Configuration loading options
 * @param logger - Optional custom logger instance
 * @returns Promise resolving to configured Lithia instance
 */
export async function createLithia(
  config: LithiaConfig = {},
  opts: LoadConfigOptions = {},
  logger?: Logger,
): Promise<Lithia> {
  // implementation
}
```

### Documentation Updates

When adding features or making changes, update:

- **README.md** - If feature is user-facing
- **Type definitions** - Keep types accurate
- **Examples** - Add examples for new features
- **Migration guides** - For breaking changes

## Getting Help

- **GitHub Discussions**: [Ask questions](https://github.com/lithia-framework/lithia/discussions)
- **Discord**: Join our community (coming soon)
- **Email**: [support@lithiajs.com](mailto:support@lithiajs.com)

## Recognition

Contributors are recognized in:

- **GitHub Contributors page**
- **Release notes** (for significant contributions)
- **Special thanks** in README (for major features)

## License

By contributing to Lithia, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to Lithia!** 🚀

Every contribution, no matter how small, helps make Lithia better for everyone.
