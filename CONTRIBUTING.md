# Contributing to Collab-PM

Thank you for your interest in contributing to Collab-PM! This document provides
guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to
uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/collab-pm.git
   cd collab-pm
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/afnanahmadtariq/collab-pm.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Set up environment** (see [PROJECT_PLAN.md](PROJECT_PLAN.md) for details)

## Development Workflow

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and ensure tests pass:
   ```bash
   pnpm test
   pnpm lint
   pnpm check-types
   ```

4. **Commit your changes** using conventional commits (see below)

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against the `main` branch

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Link any related issues using "Fixes #123" or "Closes #123"
3. Update documentation if needed
4. Ensure all CI checks pass
5. Request review from maintainers
6. Address any feedback from reviewers

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Export types that are used across modules

### React

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Use meaningful component names

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use semantic class names with `cn()` utility

### API

- Use GraphQL for data fetching
- Implement proper error handling
- Validate inputs with Zod
- Write resolvers in a consistent style

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Other changes |

### Examples

```bash
feat(auth): add JWT refresh token support
fix(tasks): resolve drag-drop ordering issue
docs(readme): update installation instructions
refactor(api): extract user service logic
test(tasks): add unit tests for task creation
```

## Questions?

If you have questions, feel free to:
- Open a Discussion on GitHub
- Create an Issue for bugs or feature requests
- Reach out to the maintainers

Thank you for contributing! 🎉
