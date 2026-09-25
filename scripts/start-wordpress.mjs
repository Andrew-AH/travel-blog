import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const envFile = new URL('../.env', import.meta.url)
let existing = ''
try { existing = await readFile(envFile, 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error }
const defaults = {
  WP_PORT: '8080',
  WP_ADMIN_USER: 'weiadmin',
  WP_ADMIN_EMAIL: 'admin@weis.local',
  WP_ADMIN_PASSWORD: randomBytes(24).toString('hex'),
  WP_DB_PASSWORD: randomBytes(24).toString('hex'),
  WP_DB_ROOT_PASSWORD: randomBytes(24).toString('hex'),
}
const missing = Object.entries(defaults).filter(([key]) => !new RegExp(`^${key}=`, 'm').test(existing))
if (missing.length) {
  await writeFile(envFile, `${existing}${existing.endsWith('\n') || !existing ? '' : '\n'}\n# Local WordPress Docker settings. Keep this file private.\n${missing.map(([key, value]) => `${key}=${value}`).join('\n')}\n`, { mode: 0o600 })
  console.log('Saved local WordPress settings and generated passwords in .env.')
}
function docker(args, capture = false) {
  const result = spawnSync('docker', ['compose', ...args], { cwd: root, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) {
    if (capture) console.error(result.stderr)
    throw new Error(`docker compose ${args[0]} failed. Check Docker Desktop and run this command again.`)
  }
  return result.stdout?.trim()
}
docker(['up', '-d'])
docker(['wait', 'setup'], true)
const setupState = JSON.parse(docker(['ps', '-a', '--format', 'json', 'setup'], true))
const setupExit = (Array.isArray(setupState) ? setupState[0] : setupState).ExitCode
docker(['logs', '--no-log-prefix', 'setup'])
if (Number(setupExit) !== 0) throw new Error(`WordPress setup failed (exit ${setupExit}). See the setup logs above.`)
console.log('Login credentials: WP_ADMIN_USER and WP_ADMIN_PASSWORD in the project .env file.')
