import * as p from '@clack/prompts'
import { cloneTemplate } from './clone-template.ts'
import { findTemplate } from './find-template.ts'
import type { ResolvedArgs } from './get-args.ts'
import { initGit } from './init-git.ts'
import { installDeps } from './install-deps.ts'
import { rewritePackageJson } from './rewrite-package-json.ts'

export interface CreateAppOptions {
  args: ResolvedArgs
  targetDir: string
}

async function runStep(title: string, fn: () => Promise<string>): Promise<void> {
  const s = p.spinner()
  s.start(title)
  try {
    const message = await fn()
    s.stop(message)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    s.stop(`${title} — failed`)
    throw new Error(`${title}: ${msg}`, { cause: error })
  }
}

export async function createApp({ args, targetDir }: CreateAppOptions): Promise<void> {
  const template = findTemplate(args.template)

  await runStep('Cloning template', async () => {
    await cloneTemplate(template, targetDir)
    return 'Template cloned'
  })

  await runStep('Rewriting package.json', async () => {
    rewritePackageJson(targetDir, args.name)
    return 'Package configured'
  })

  if (!args.skipInstall) {
    await runStep('Installing dependencies', async () => {
      const pm = await installDeps(targetDir, args.pm)
      return `Installed with ${pm}`
    })
  }

  if (!args.skipGit) {
    await runStep('Initializing git repository', async () => {
      const result = await initGit(targetDir)
      return result === 'skipped' ? 'Skipped — git not found' : 'Git initialized'
    })
  }
}
