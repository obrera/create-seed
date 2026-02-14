import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function rewritePackageJson(targetDir: string, projectName: string): void {
  const pkgPath = resolve(targetDir, 'package.json')
  if (!existsSync(pkgPath)) {
    return
  }

  const pkg: Record<string, unknown> = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  pkg.name = projectName
  pkg.version = '0.0.0'

  // Clear template-specific fields
  delete pkg.repository
  delete pkg.homepage
  delete pkg.bugs

  // Reset description
  pkg.description = ''

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}
