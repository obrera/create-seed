import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { execAsync } from './exec-async.ts'

export async function rewritePackageJson(targetDir: string, projectName: string): Promise<void> {
  const pkgPath = resolve(targetDir, 'package.json')
  if (!existsSync(pkgPath)) {
    return
  }

  const pkg: Record<string, unknown> = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  pkg.name = basename(resolve(projectName))
  pkg.version = '0.0.0'

  // Clear template-specific fields
  delete pkg.repository
  delete pkg.homepage
  delete pkg.bugs

  // Reset description
  pkg.description = ''

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  // If biome is configured, format the rewritten package.json
  const biomePath = resolve(targetDir, 'biome.json')
  const biomeAltPath = resolve(targetDir, 'biome.jsonc')
  if (existsSync(biomePath) || existsSync(biomeAltPath)) {
    try {
      await execAsync('npx', ['@biomejs/biome', 'check', '--write', 'package.json'], { cwd: targetDir })
    } catch (error) {
      // Best-effort — don't fail the scaffold if biome formatting fails
      console.warn('Warning: Failed to format package.json with Biome.', error)
    }
  }
}
