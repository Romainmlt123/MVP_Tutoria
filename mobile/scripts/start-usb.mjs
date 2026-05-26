#!/usr/bin/env node
/**
 * Dev via câble USB (Android) : adb reverse pour Metro + Vite.
 * Dans Expo Go : saisir exp://127.0.0.1:8081 ou scanner si proposé.
 */
import { execSync, spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOBILE_ROOT = join(__dirname, '..')
const FRONTEND_ROOT = join(MOBILE_ROOT, '..', 'frontend')
const BASE_VITE_PORT = Number(process.env.VITE_PORT || 5173)

async function viteResponds(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(1500),
    })
    return res.ok || res.status === 404
  } catch {
    return false
  }
}

async function discoverVitePort(maxMs = 90_000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    for (let p = BASE_VITE_PORT; p < BASE_VITE_PORT + 20; p++) {
      if (await viteResponds(p)) return p
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error('Vite ne répond pas.')
}

function adbReverse(port) {
  execSync(`adb reverse tcp:${port} tcp:${port}`, { stdio: 'inherit' })
}

function spawnLogged(command, args, options) {
  const child = spawn(command, args, { stdio: 'inherit', ...options })
  child.on('error', (err) => {
    console.error(err.message)
    process.exit(1)
  })
  return child
}

try {
  execSync('adb devices', { stdio: 'pipe' })
} catch {
  console.error(
    'adb introuvable. Installez android-tools-adb, branchez le téléphone,\n' +
      'activez le débogage USB, acceptez « Autoriser le débogage ».',
  )
  process.exit(1)
}

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log("  Tutor'IA — mode USB (Android + câble)")
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  Débogage USB activé, téléphone branché.')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')

const vite = spawnLogged('npm', ['run', 'dev:lan'], {
  cwd: FRONTEND_ROOT,
  env: { ...process.env, VITE_PORT: String(BASE_VITE_PORT) },
})

let expo = null
const shutdown = () => {
  if (expo && !expo.killed) expo.kill('SIGTERM')
  if (vite && !vite.killed) vite.kill('SIGTERM')
  setTimeout(() => process.exit(0), 300)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

let vitePort
try {
  vitePort = await discoverVitePort()
} catch (e) {
  console.error(e.message)
  vite.kill('SIGTERM')
  process.exit(1)
}

adbReverse(8081)
adbReverse(vitePort)

const appUrl = `http://127.0.0.1:${vitePort}`
writeFileSync(join(MOBILE_ROOT, '.env'), `EXPO_PUBLIC_APP_URL=${appUrl}\n`, 'utf8')

console.log(`  WebView → ${appUrl} (via adb reverse)`)
console.log('  Expo Go → exp://127.0.0.1:8081')
console.log('  (Saisie manuelle si le QR ne marche pas)')
console.log('')

expo = spawnLogged('npx', ['expo', 'start', '--localhost', '-c'], {
  cwd: MOBILE_ROOT,
  env: { ...process.env, EXPO_PUBLIC_APP_URL: appUrl },
})

expo.on('exit', (code) => {
  if (vite && !vite.killed) vite.kill('SIGTERM')
  process.exit(code ?? 0)
})
vite.on('exit', (code) => {
  if (code !== 0 && code != null) {
    if (expo && !expo.killed) expo.kill('SIGTERM')
    process.exit(code)
  }
})
