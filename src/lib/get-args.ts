import { Command } from 'commander'
import { getAppInfo } from './get-app-info.ts'
import { getTemplatesUrl } from './get-templates.ts'

export interface Args {
  dryRun: boolean
  list: boolean
  name: string | undefined
  pm: string | undefined
  skipGit: boolean
  skipInstall: boolean
  template: string | undefined
  templatesUrl: string
  verbose: boolean
}

/** Args after prompts have resolved all required fields */
export interface ResolvedArgs extends Args {
  name: string
  template: string
}

export function getArgs(argv: string[]): Args {
  const { name, version } = getAppInfo()
  const program = new Command()

  program
    .name(name)
    .description('Scaffold a new project from a template')
    .version(version)
    .argument('[name]', 'Project name')
    .option('-t, --template <template>', 'Template to use (gh:owner/repo/path or local path)')
    .option('--pm <pm>', 'Package manager (npm|pnpm|bun, default: auto-detect)')
    .option('--skip-git', 'Skip git initialization', false)
    .option('--skip-install', 'Skip installing dependencies', false)
    .option('-l, --list', 'List available templates', false)
    .option('--templates-url <url>', 'URL or local path to templates.json', getTemplatesUrl())
    .option('-d, --dry-run', 'Dry run', false)
    .option('-v, --verbose', 'Verbose output', false)
    .parse(argv)

  const opts = program.opts()

  return {
    dryRun: opts.dryRun,
    list: opts.list,
    name: program.args[0],
    pm: opts.pm,
    skipGit: opts.skipGit,
    skipInstall: opts.skipInstall,
    template: opts.template,
    templatesUrl: opts.templatesUrl,
    verbose: opts.verbose,
  }
}
