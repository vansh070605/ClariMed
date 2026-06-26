# Contributing to ClariMed

Thank you for your interest in contributing to ClariMed! As an explainable healthcare copilot, we hold our code quality, safety, and deterministic logic to the highest standards.

Please review this guide before submitting issues or creating pull requests.

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to `security@clarimed.example.com`.

---

## 2. Getting Started

### Development Environment Setup
To set up a local workspace for development:

1. **Fork and Clone** the repository:
   ```bash
   git clone https://github.com/your-username/ClariMed.git
   cd ClariMed
   ```

2. **Branching Strategy:**
   - Always branch from `main` or `develop`.
   - Use descriptive branch prefixes:
     - `feature/name-of-feature`
     - `bugfix/issue-description`
     - `docs/doc-topic`
     - `refactor/area-of-change`

3. **Running the App Locally:**
   Refer to the [Root README](README.md) for startup options using either **Docker Compose** or **Local Host development servers** (FastAPI backend + Next.js frontend).

---

## 3. Coding Guidelines

### Backend (Python / FastAPI)
- **Style Guide:** Follow PEP 8 guidelines.
- **Linting & Formatting:** We use `Ruff` or `black` + `flake8` for formatting.
- **Type Checking:** All function arguments and return types must be fully typed. Run `mypy` to verify types.
- **Testing:** Create tests under the `backend/tests/` directory. Run tests using `pytest`:
  ```bash
  cd backend
  pytest
  ```

### Frontend (TypeScript / Next.js)
- **Style Guide:** Consistent TypeScript configurations using ESLint.
- **Styling:** Use Tailwind CSS v4 variables mapped in `globals.css`. Ensure new classes use semantic variables rather than hardcoded hex codes.
- **Component Design:** Keep components decoupled, atomic, and modular. Ensure everything compiles with no TypeScript warnings (`@ts-ignore` / `@ts-expect-error` should only be used as a last resort with a comment explanation).
- **Compilation Check:** Always verify the project builds cleanly before making a PR:
  ```bash
  cd frontend
  npm run build
  ```

---

## 4. Pull Request Process

We review all pull requests carefully. To ensure your PR is merged efficiently, please follow this checklist:

1. **Create an Issue:** Ensure an issue exists for the bug or feature you are addressing.
2. **Write Tests:** Provide automated tests for backend logic or API handlers.
3. **Run Code Verification:**
   - Make sure frontend builds cleanly.
   - Run backend test suite.
4. **Document Changes:** Update inline code comments, markdown files in `/docs`, or the root README as necessary.
5. **Open the PR:** Use the pull request template provided. Describe the changes, link the issue, and provide verification screenshots/recordings if the PR includes visual changes.

---

## 5. Security & Privacy

Since ClariMed deals with medical data:
- **Never commit credentials, API keys, or database dumps** to git.
- If you find a security vulnerability, **do not open a public issue**. Email the details directly to our security team.

We look forward to building secure and explainable health tools with you!
