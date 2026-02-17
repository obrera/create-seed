import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export type PackageManager = 'bun' | 'npm' | 'pnpm'

const VALID_PMS: PackageManager[] = ['bun', 'npm', 'pnpm']

const LOCKFILE_PM: Record<string, PackageManager> = {
  'bun.lock': 'bun',
  'package-lock.json': 'npm',
  'pnpm-lock.yaml': 'pnpm',
}

export function detectPm(explicit?: string, targetDir?: string): PackageManager {
  if (explicit) {
    if (!VALID_PMS.includes(explicit as PackageManager)) {
      throw new Error(`Invalid package manager: "${explicit}". Must be one of: ${VALID_PMS.join(', ')}`)
    }
    return explicit as PackageManager
  }

  // Check for lockfiles in the cloned template first
  if (targetDir) {
    for (const [lockfile, pm] of Object.entries(LOCKFILE_PM)) {
      if (existsSync(resolve(targetDir, lockfile))) {
        return pm
      }
    }
  }

  // Fall back to user agent (set by package managers when running via npx/bunx/pnpx)
  const userAgent = process.env.npm_config_user_agent ?? ''
  if (userAgent.startsWith('pnpm')) {
    return 'pnpm'
  }
  if (userAgent.startsWith('bun')) {
    return 'bun'
  }
  if (userAgent.startsWith('npm')) {
    return 'npm'
  }

  // Default to bun
  return 'bun'
}
