import { execSync } from 'node:child_process'
import { execAsync } from './exec-async.ts'

function hasGit(): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function getGitUser(): { name: string; email: string } {
  const name = execSafe('git config --global user.name') ?? 'seed'
  const email = execSafe('git config --global user.email') ?? 'seed@example.com'
  return { email, name }
}

function execSafe(cmd: string): string | undefined {
  try {
    return execSync(cmd, { windowsHide: true }).toString().trim() || undefined
  } catch {
    return undefined
  }
}

function getGitEnv(): NodeJS.ProcessEnv {
  const { name, email } = getGitUser()
  return {
    ...process.env,
    GIT_AUTHOR_EMAIL: email,
    GIT_AUTHOR_NAME: name,
    GIT_COMMITTER_EMAIL: email,
    GIT_COMMITTER_NAME: name,
  }
}

export async function initGitRepo(targetDir: string): Promise<'initialized' | 'skipped'> {
  if (!hasGit()) {
    return 'skipped'
  }

  const env = getGitEnv()
  await execAsync('git', ['init', '-b', 'main'], { cwd: targetDir, env })

  return 'initialized'
}

export async function commitGitRepo(targetDir: string): Promise<'committed' | 'skipped'> {
  if (!hasGit()) {
    return 'skipped'
  }
  const env = getGitEnv()
  await execAsync('git', ['add', '.'], { cwd: targetDir, env })
  await execAsync('git', ['commit', '-m', 'chore: initial commit'], { cwd: targetDir, env })
  return 'committed'
}
