// Static demo for GitHub Pages: Vite build with VITE_DEMO=1 and the
// /StackProof/ base, plus the API services bundled for the browser.
import { execSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const client = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const server = path.resolve(client, '../server')
const dist = path.join(client, 'dist')
// esbuild is a dev dependency of the server package (npm ci there first).
const { build } = createRequire(path.join(server, 'package.json'))('esbuild')

execSync('npx tsc -b && npx vite build --base=/StackProof/', {
  cwd: client,
  stdio: 'inherit',
  env: { ...process.env, VITE_DEMO: '1' },
})

await build({
  entryPoints: [path.join(server, 'src/demo/browserApi.js')],
  outfile: path.join(dist, 'demo-api.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  nodePaths: [path.join(server, 'node_modules')],
  alias: {
    crypto: path.join(server, 'src/demo/cryptoShim.js'),
    jsonwebtoken: path.join(server, 'src/demo/jwtShim.js'),
  },
  define: { 'process.env': '{}' },
  logLevel: 'warning',
})

await writeFile(path.join(dist, '.nojekyll'), '')
console.log('Built static demo in client/dist/')
