#!/usr/bin/env node
/**
 * Démarre Vite (frontend) + Expo Go en pointant la WebView vers le dev local.
 * Usage : npm start (depuis mobile/)
 *
 * EXPO_TUNNEL=1 — force le tunnel ngrok (défaut : --lan, même Wi‑Fi)
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOBILE_ROOT = join(__dirname, '..')
const FRONTEND_ROOT = join(MOBILE_ROOT, '..', 'frontend')
const BASE_VITE_PORT = Number(process.env.VITE_PORT || 5173)
const VITE_PORT_SCAN = 20

function getLanIp() {
  const nets = networkInterfaces()
  for (const ifaces of Object.values(nets)) {
    for (const net of ifaces ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return '127.0.0.1'
}

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

/** Trouve le port où Vite écoute (5173, 5174, … si occupé). */
async function discoverVitePort(maxMs = 90_000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    for (let p = BASE_VITE_PORT; p < BASE_VITE_PORT + VITE_PORT_SCAN; p++) {
      if (await viteResponds(p)) return p
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(
    `Vite ne répond sur aucun port ${BASE_VITE_PORT}–${BASE_VITE_PORT + VITE_PORT_SCAN - 1}. ` +
      'Vérifiez les logs ci-dessus.',
  )
}

function writeAppUrl(lanIp, port) {
  const appUrl = `http://${lanIp}:${port}`
  writeFileSync(join(MOBILE_ROOT, '.env'), `EXPO_PUBLIC_APP_URL=${appUrl}\n`, 'utf8')
  return appUrl
}

function spawnLogged(name, command, args, options) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    ...options,
  })
  child.on('error', (err) => {
    console.error(`[${name}]`, err.message)
    process.exit(1)
  })
  return child
}

const lanIp = getLanIp()
const useTunnel = process.env.EXPO_TUNNEL === '1'

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log("  Tutor'IA — mode développement (Expo Go)")
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  Détection du port Vite…')
console.log('')
console.log('  Même Wi‑Fi pour le téléphone et ce PC.')
console.log('  Scannez le QR **LAN** (pas Tunnel sauf EXPO_TUNNEL=1).')
console.log('  Si l’API ne répond pas : VITE_API_URL = IP du PC dans frontend/.env')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')

const vite = spawnLogged('vite', 'npm', ['run', 'dev:lan'], {
  cwd: FRONTEND_ROOT,
  env: { ...process.env, VITE_PORT: String(BASE_VITE_PORT) },
})

let expo = null
let appUrl = ''

const shutdown = (signal) => {
  console.log(`\nArrêt (${signal})…`)
  if (expo && !expo.killed) expo.kill('SIGTERM')
  if (vite && !vite.killed) vite.kill('SIGTERM')
  setTimeout(() => process.exit(0), 300)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

let vitePort
try {
  vitePort = await discoverVitePort()
} catch (err) {
  console.error(err.message)
  vite.kill('SIGTERM')
  process.exit(1)
}

appUrl = writeAppUrl(lanIp, vitePort)

if (vitePort !== BASE_VITE_PORT) {
  console.log(
    `  ⚠ Port ${BASE_VITE_PORT} occupé → Vite sur ${vitePort} (WebView mise à jour).`,
  )
}
console.log(`  WebView → ${appUrl}`)
console.log(`  Expo → ${useTunnel ? 'tunnel' : 'LAN'} (bundle Metro)`)
console.log('')

const expoArgs = useTunnel
  ? ['expo', 'start', '--tunnel', '-c']
  : ['expo', 'start', '--lan', '-c']

expo = spawnLogged('expo', 'npx', expoArgs, {
  cwd: MOBILE_ROOT,
  env: {
    ...process.env,
    EXPO_PUBLIC_APP_URL: appUrl,
  },
})

expo.on('exit', (code) => {
  if (vite && !vite.killed) vite.kill('SIGTERM')
  process.exit(code ?? 0)
})

vite.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    if (expo && !expo.killed) expo.kill('SIGTERM')
    process.exit(code)
  }
})
