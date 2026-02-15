# create-seed

## 1.0.0

### Major Changes

- 8fa92f2: Initial stable release. 🌱

### Minor Changes

- a00a470: Core scaffold CLI: template cloning via giget, PM auto-detection, git init with fallback identity, portable (no Bun runtime dependency)
- cfd358f: Support short template names that resolve from the template registry (e.g. `bun-library` instead of `gh:beeman/templates/bun-library`)
- b2d10db: Add anonymous usage analytics via Umami. Respects DO_NOT_TRACK and CI environments.
- a45b87b: Interactive prompts: ask for project name and template when not provided as args, confirm overwrite if directory exists
- 14a6ac0: Add `registry generate` and `registry validate` subcommands for managing template registries
- 7c39f1d: Template registry: --list flag to show available templates, interactive template select from remote registry

### Patch Changes

- fd6deba: Fix network-coupled tests, repository URL normalization, Windows path detection, and local templates-url handling
- 27f1e24: Prevent path traversal in project name that could delete files outside the current directory
- a93218e: Fix git init failing due to shell splitting commit message args
- c680688: Fix spinner not animating during dependency installation by using async exec instead of execSync
- 2d3fc76: Fix URLs being treated as local paths in template registry
- 8638df9: Rewrite package.json after cloning: set project name, reset version/description, clear template-specific fields
