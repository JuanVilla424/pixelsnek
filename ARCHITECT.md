# Architecture — pixelsnek

## Overview

pixelsnek is a node project created from the github-cicd-template.

## Tech Stack

| Layer           | Technology           |
| --------------- | -------------------- |
| Language        | Node.js 20+          |
| Package Manager | npm                  |
| CI/CD           | GitHub Actions       |
| Pre-commit      | pre-commit framework |
| Version Control | Git + GitHub         |

## Project Structure

```
pixelsnek/
├── .github/workflows/      # CI/CD pipelines
├── scripts/                 # Shared CI/CD scripts (submodule)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config (if applicable)
├── .bumpversion.cfg         # Version bump config
├── .pre-commit-config.yaml  # Pre-commit hooks
├── CHANGELOG.md
├── ARCHITECT.md
├── CONTEXT.md
├── CLAUDE.md
├── MEMORY.md
└── README.md
```

## Design Decisions

| Decision        | Choice               | Rationale                                   |
| --------------- | -------------------- | ------------------------------------------- |
| Template        | github-cicd-template | Standard CI/CD, pre-commit hooks, workflows |
| Branch strategy | dev → main           | Trunk-based development with dev branch     |
| License         | GPLv3                | Standard open-source license                |
