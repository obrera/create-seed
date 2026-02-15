# create-seed 🌱

Scaffold a new project from a template. Fast, portable, zero config.

## Usage

```bash
# With bun
bun x create-seed@latest my-app -t bun-library

# With npx
npx create-seed@latest my-app -t bun-library

# With pnpx
pnpx create-seed@latest my-app -t bun-library
```

## Options

```
Usage: create-seed [options] [name]

Scaffold a new project from a template

Arguments:
  name                         Project name

Options:
  -V, --version                output the version number
  -t, --template <template>    Template to use (gh:owner/repo/path or local path)
  --pm <pm>                    Package manager (npm|pnpm|bun, default: auto-detect)
  --skip-git                   Skip git initialization (default: false)
  --skip-install               Skip installing dependencies (default: false)
  -d, --dry-run                Dry run (default: false)
  -v, --verbose                Verbose output (default: false)
  -h, --help                   display help for command
```

## Templates

Browse available templates at [beeman/templates](https://github.com/beeman/templates).

You can also use any GitHub repo, subdirectory, or local path as a template:

```bash
# Short name (from the default registry)
bun x create-seed@latest my-app -t bun-library

# GitHub repo
bun x create-seed@latest my-app -t gh:owner/repo

# GitHub subdirectory
bun x create-seed@latest my-app -t gh:owner/repo/path

# GitHub branch
bun x create-seed@latest my-app -t gh:owner/repo#my-branch

# GitHub subdirectory on a specific branch
bun x create-seed@latest my-app -t gh:owner/repo/path#my-branch

# Local path
bun x create-seed@latest my-app -t ./my-local-template
```

## What it does

1. **Clones the template** — downloads from GitHub (via [giget](https://github.com/unjs/giget)) or copies from a local path
2. **Installs dependencies** — auto-detects your package manager (bun/npm/pnpm)
3. **Initializes git** — `git init` + initial commit (skips gracefully if git is not installed or not configured)

## Package manager detection

`create-seed` auto-detects which package manager you're using based on how you ran it:

| Command | Detected PM |
|---------|-------------|
| `bun x create-seed@latest` | bun |
| `npx create-seed@latest` | npm |
| `pnpx create-seed@latest` | pnpm |

Override with `--pm`:

```bash
bun x create-seed@latest my-app -t gh:owner/repo --pm bun
```

## Analytics

Anonymous usage statistics are collected via [Umami](https://umami.is) to help improve the tool. No personally identifiable information is collected.

Data collected: OS, architecture, Node version, package manager, template name, and success/failure status.

To opt out, set the `DO_NOT_TRACK` environment variable:

```bash
DO_NOT_TRACK=1 bun x create-seed@latest my-app -t gh:owner/repo
```

Analytics are also automatically disabled in CI environments.

## Development

```bash
bun install
bun run build
bun run test
bun run lint
```

## License

MIT – see [LICENSE](./LICENSE).
