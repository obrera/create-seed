import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { detectPm, type PackageManager } from './detect-pm.ts'
import { execAsync } from './exec-async.ts'

const LOCKFILES: Record<PackageManager, string> = {
  bun: 'bun.lock',
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
}

export async function installDeps(targetDir: string, explicitPm?: string): Promise<PackageManager> {
  const pm = detectPm(explicitPm, targetDir)

  // Delete lockfiles for other package managers
  for (const [key, lockfile] of Object.entries(LOCKFILES)) {
    if (key !== pm) {
      const lockPath = resolve(targetDir, lockfile)
      if (existsSync(lockPath)) {
        unlinkSync(lockPath)
      }
    }
  }

  // Clean npm_config_user_agent so tools like `only-allow` see the correct PM
  const env = { ...process.env }
  delete env.npm_config_user_agent

  await execAsync(pm, ['install'], { cwd: targetDir, env, shell: true })

  return pm
}
