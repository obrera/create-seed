import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { rewritePackageJson } from '../src/lib/rewrite-package-json.ts'

describe('rewritePackageJson', () => {
  const tmpDir = join(import.meta.dirname, 'fixtures', 'tmp-rewrite')

  afterEach(() => {
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true })
    }
  })

  function setup(pkg: Record<string, unknown>): void {
    mkdirSync(tmpDir, { recursive: true })
    writeFileSync(join(tmpDir, 'package.json'), JSON.stringify(pkg, null, 2))
  }

  function readPkg(): Record<string, unknown> {
    return JSON.parse(readFileSync(join(tmpDir, 'package.json'), 'utf-8'))
  }

  test('uses basename when projectName is an absolute path', async () => {
    setup({ name: 'template-name', version: '1.0.0' })
    await rewritePackageJson(tmpDir, '/home/user/my-app')
    expect(readPkg().name).toBe('my-app')
  })

  test('uses basename when projectName is a relative path', async () => {
    setup({ name: 'template-name', version: '1.0.0' })
    await rewritePackageJson(tmpDir, '../projects/my-app')
    expect(readPkg().name).toBe('my-app')
  })

  test('works with a simple name', async () => {
    setup({ name: 'template-name', version: '1.0.0' })
    await rewritePackageJson(tmpDir, 'my-app')
    expect(readPkg().name).toBe('my-app')
  })

  test('resets version to 0.0.0', async () => {
    setup({ name: 'template-name', version: '1.2.3' })
    await rewritePackageJson(tmpDir, 'my-app')
    expect(readPkg().version).toBe('0.0.0')
  })

  test('clears template-specific fields', async () => {
    setup({
      bugs: 'https://github.com/example/repo/issues',
      description: 'A template',
      homepage: 'https://example.com',
      name: 'template-name',
      repository: 'https://github.com/example/repo',
      version: '1.0.0',
    })
    await rewritePackageJson(tmpDir, 'my-app')
    const pkg = readPkg()
    expect(pkg.repository).toBeUndefined()
    expect(pkg.homepage).toBeUndefined()
    expect(pkg.bugs).toBeUndefined()
    expect(pkg.description).toBe('')
  })
})
