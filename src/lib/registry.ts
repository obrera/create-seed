import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export interface RegistryTemplate {
  description: string
  id: string
  name: string
  path: string
}

export interface Registry {
  templates: RegistryTemplate[]
}

const REGISTRY_FILENAME = 'templates.json'

function isTemplate(dir: string): boolean {
  return existsSync(join(dir, 'package.json'))
}

function readTemplateInfo(dir: string, name: string): RegistryTemplate | null {
  const pkgPath = join(dir, 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return {
      description: pkg.description ?? '',
      id: name,
      name: pkg.name ?? name,
      path: name,
    }
  } catch {
    return null
  }
}

export function scanTemplates(root: string): RegistryTemplate[] {
  const entries = readdirSync(root, { withFileTypes: true })
  const templates: RegistryTemplate[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const dir = join(root, entry.name)
    if (isTemplate(dir)) {
      const info = readTemplateInfo(dir, entry.name)
      if (info) {
        templates.push(info)
      }
    }
  }

  return templates.sort((a, b) => a.name.localeCompare(b.name))
}

export function generateRegistry(root: string): Registry {
  const repoName = detectRepoName(root)
  const templates = scanTemplates(root).map((t) => ({
    ...t,
    id: repoName ? `gh:${repoName}/${t.path}` : t.path,
  }))
  return { templates }
}

export function writeRegistry(root: string, registry: Registry): string {
  const filePath = join(root, REGISTRY_FILENAME)
  writeFileSync(filePath, `${JSON.stringify(registry, null, 2)}\n`)
  return filePath
}

interface RegistryMeta {
  description: string
  name: string
}

function readRegistryMeta(root: string): RegistryMeta {
  const pkgPath = join(root, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return {
      description: pkg.description ?? '',
      name: pkg.name ?? 'Templates',
    }
  }
  return { description: '', name: 'Templates' }
}

function detectRepoName(root: string): string | undefined {
  // 1. Check top-level package.json for repository.name (preferred, like CSD)
  const pkgPath = join(root, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (typeof pkg.repository === 'object' && pkg.repository?.name) {
        return pkg.repository.name
      }
      if (typeof pkg.repository === 'string' && pkg.repository.includes('/')) {
        return pkg.repository
      }
    } catch {
      // ignore
    }
  }

  // 2. Fall back to git remote
  try {
    const { execSync } = require('node:child_process')
    const remote = execSync('git remote get-url origin', {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
    const match = remote.match(/github\.com[/:](.+?)(?:\.git)?$/)
    return match?.[1]
  } catch {
    return undefined
  }
}

export function generateReadme(root: string, registry: Registry): string {
  const meta = readRegistryMeta(root)

  const lines: string[] = []

  lines.push(`# ${meta.name}`)
  lines.push('')
  if (meta.description) {
    lines.push(meta.description)
    lines.push('')
  }

  lines.push('## Available Templates')
  lines.push('')

  for (const template of registry.templates) {
    lines.push(`### \`${template.path}\``)
    lines.push('')
    if (template.description) {
      lines.push(template.description)
      lines.push('')
    }
    lines.push('```bash')
    lines.push(`bun x create-seed@latest my-app -t ${template.id}`)
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

export function writeReadme(root: string, content: string): string {
  const filePath = join(root, 'README.md')
  writeFileSync(filePath, content)
  return filePath
}

export interface ValidationError {
  message: string
  type: 'error' | 'warning'
}

export function validateRegistry(root: string): ValidationError[] {
  const errors: ValidationError[] = []
  const filePath = join(root, REGISTRY_FILENAME)

  if (!existsSync(filePath)) {
    errors.push({ message: `${REGISTRY_FILENAME} not found`, type: 'error' })
    return errors
  }

  let registry: Registry
  try {
    registry = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    errors.push({ message: `${REGISTRY_FILENAME} is not valid JSON`, type: 'error' })
    return errors
  }

  if (!registry.templates || !Array.isArray(registry.templates)) {
    errors.push({ message: '`templates` property is missing or not an array', type: 'error' })
    return errors
  }

  for (const template of registry.templates) {
    if (!template.name) {
      errors.push({ message: 'Template missing required field: name', type: 'error' })
      continue
    }
    if (!template.path) {
      errors.push({ message: `Template "${template.name ?? '?'}" missing required field: path`, type: 'error' })
      continue
    }
    if (!template.id) {
      errors.push({ message: `Template "${template.name}" missing required field: id`, type: 'error' })
    }
    if (!template.description) {
      errors.push({ message: `Template "${template.name}" missing description`, type: 'warning' })
    }
    const dir = resolve(root, template.path)
    if (!existsSync(dir)) {
      errors.push({ message: `Template "${template.name}" path does not exist: ${template.path}`, type: 'error' })
    } else if (!existsSync(join(dir, 'package.json'))) {
      errors.push({
        message: `Template "${template.name}" has no package.json in: ${template.path}`,
        type: 'error',
      })
    }
  }

  // Check README.md is up to date
  const readmePath = join(root, 'README.md')
  if (existsSync(readmePath)) {
    const currentReadme = readFileSync(readmePath, 'utf-8')
    const expectedReadme = generateReadme(root, registry)
    if (currentReadme !== expectedReadme) {
      errors.push({
        message: 'README.md is out of date — run `create-seed registry generate` to update',
        type: 'warning',
      })
    }
  } else {
    errors.push({ message: 'README.md not found — run `create-seed registry generate` to create', type: 'warning' })
  }

  // Check for orphaned templates (dirs that exist but aren't in registry)
  const registeredPaths = new Set(registry.templates.map((t) => t.path))
  const actualTemplates = scanTemplates(root)
  for (const t of actualTemplates) {
    if (!registeredPaths.has(t.path)) {
      errors.push({ message: `Orphaned template not in registry: ${t.path}`, type: 'warning' })
    }
  }

  return errors
}
