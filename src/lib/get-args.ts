import { Command } from 'commander'
import { getAppInfo } from './get-app-info.ts'
import { getTemplatesUrl } from './get-templates.ts'

export interface Args {
  command: 'create' | 'registry-generate' | 'registry-validate'
  dryRun: boolean
  list: boolean
  name: string | undefined
  pm: string | undefined
  registryDir: string
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

  let result: Args | undefined

  const defaults: Omit<Args, 'command' | 'registryDir'> = {
    dryRun: false,
    list: false,
    name: undefined,
    pm: undefined,
    skipGit: false,
    skipInstall: false,
    template: undefined,
    templatesUrl: getTemplatesUrl(),
    verbose: false,
  }

  program.name(name).description('Scaffold a new project from a template').version(version)

  // Default command (create)
  program
    .argument('[name]', 'Project name')
    .option('-t, --template <template>', 'Template to use (gh:owner/repo/path or local path)')
    .option('--pm <pm>', 'Package manager (npm|pnpm|bun, default: auto-detect)')
    .option('--skip-git', 'Skip git initialization', false)
    .option('--skip-install', 'Skip installing dependencies', false)
    .option('-l, --list', 'List available templates', false)
    .option('--templates-url <url>', 'URL or local path to templates.json', getTemplatesUrl())
    .option('-d, --dry-run', 'Dry run', false)
    .option('-v, --verbose', 'Verbose output', false)
    .action((_name, opts) => {
      result = {
        ...defaults,
        command: 'create',
        dryRun: opts.dryRun,
        list: opts.list,
        name: program.args[0],
        pm: opts.pm,
        registryDir: '.',
        skipGit: opts.skipGit,
        skipInstall: opts.skipInstall,
        template: opts.template,
        templatesUrl: opts.templatesUrl,
        verbose: opts.verbose,
      }
    })

  // Registry command group
  const registry = program.command('registry').description('Manage template registries')

  registry
    .command('generate')
    .description('Scan templates and generate templates.json')
    .option('--dir <dir>', 'Directory to scan', '.')
    .action((opts) => {
      result = { ...defaults, command: 'registry-generate', registryDir: opts.dir }
    })

  registry
    .command('validate')
    .description('Validate templates.json against actual templates')
    .option('--dir <dir>', 'Directory containing templates.json', '.')
    .action((opts) => {
      result = { ...defaults, command: 'registry-validate', registryDir: opts.dir }
    })

  program.parse(argv)

  if (!result) {
    result = { ...defaults, command: 'create', registryDir: '.' }
  }

  return result
}
