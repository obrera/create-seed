import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_TEMPLATES_URL = 'https://raw.githubusercontent.com/beeman/templates/main/templates.json'

export interface Template {
  description: string
  id: string
  name: string
}

export function getTemplatesUrl(): string {
  return process.env.TEMPLATES_URL ?? DEFAULT_TEMPLATES_URL
}

function isLocalPath(source: string): boolean {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return false
  }
  return source.startsWith('./') || source.startsWith('../') || source.startsWith('/')
}

async function fetchData(source: string): Promise<unknown> {
  if (isLocalPath(source)) {
    const resolved = resolve(source)
    if (!existsSync(resolved)) {
      throw new Error(`Templates file not found: ${resolved}`)
    }
    return JSON.parse(readFileSync(resolved, 'utf-8'))
  }
  const res = await fetch(source)
  if (!res.ok) {
    throw new Error(`Failed to fetch templates: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function getTemplates(url: string): Promise<Template[]> {
  const data = (await fetchData(url)) as Record<string, unknown>
  if (!data || !Array.isArray(data.templates)) {
    throw new Error('Invalid template registry format: `templates` property is missing or not an array')
  }
  return data.templates as Template[]
}
