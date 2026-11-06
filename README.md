# doc-anchor-guard 📖

[![CI](https://github.com/dani-s-h007/doc-anchor-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/dani-s-h007/doc-anchor-guard/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)

> **Deep Markdown heading anchor, cross-file relative link, and asset integrity validator.**

Documentation rot is ubiquitous in software projects. When a contributor rephrases a heading (e.g. changing `## Setup` to `## Quickstart Guide`), all internal table-of-contents links and external documentation cross-references pointing to `#setup` silently break. `doc-anchor-guard` uses the standard GitHub slugification algorithm to validate every intra-document anchor, cross-file relative link, and image reference, offering Levenshtein "Did you mean?" suggestions for broken targets.

---

## ✨ Features

- **GitHub Slug Engine**: Perfectly replicates GitHub and GitLab heading anchor slugification (punctuation stripping, Unicode normalization, and duplicate collision suffixes `-1`, `-2`).
- **Cross-File Resolution**: Validates relative paths between multiple markdown files (`./docs/api.md#endpoints`).
- **Image & Asset Verification**: Detects missing local diagrams and screenshot paths (`![demo](./assets/demo.png)`).
- **Fuzzy "Did You Mean?" Suggestions**: Uses Levenshtein distance to suggest the intended valid anchor when a typo occurs.
- **CI Enforcement (`--strict`)**: Fails CI build with exit code 1 if broken documentation references exist.
- **Zero Runtime Dependencies**: Ultra-fast execution with zero third-party dependencies.

---

## 🚀 Installation

```bash
# Run on-demand with npx
npx doc-anchor-guard --help

# Or install globally
npm install -g doc-anchor-guard
```

---

## 🛠️ CLI Usage

### Scan Repository
```bash
# Check all markdown files in current directory:
doc-anchor-guard
```

### Run in CI Workflow
```bash
# Block broken pull request documentation:
doc-anchor-guard --strict
```

### JSON Output
```bash
doc-anchor-guard --json
```

---

## 💻 Programmatic TypeScript API

```typescript
import { validateMarkdownDocs } from 'doc-anchor-guard';

const report = await validateMarkdownDocs('./docs');
if (report.errors.length > 0) {
  for (const err of report.errors) {
    console.error(`Broken link in ${err.file}:${err.line} -> ${err.target}`);
    if (err.suggestion) console.log(`Suggested fix: ${err.suggestion}`);
  }
}
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📄 License

MIT © Essentials Toolkit Authors

