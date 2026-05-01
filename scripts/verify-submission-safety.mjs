import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const ignoredDirs = new Set([
  '.git',
  '.vite',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
])
const backendDirNames = new Set([
  'api',
  'apis',
  'database',
  'db',
  'indexer',
  'keeper',
  'relayer',
  'server',
  'serverless',
  'worker',
  'workers',
])
const textExtensions = new Set(['.css', '.env', '.example', '.html', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.yaml', '.yml'])
const approvedSigningFiles = new Set(['apps/web/src/hooks/useAddCollateralExecution.ts'])
const approvedTransactionFiles = new Set(['apps/web/src/lib/tx/buildAddCollateralTx.ts'])
const forbiddenSigningPatterns = [
  'signAndExecuteTransaction',
  'signTransaction',
  'useSignTransaction',
  'useSignAndExecuteTransaction',
  'executeTransactionBlock',
  'wallet.sign',
  'wallet.execute',
]
const claimPatterns = [/24\/7/i, /auto-rescue/i, /automatic liquidation protection/i, /guaranteed protection/i]
const negationPattern =
  /\b(no|not|never|without|avoid|forbidden|out of scope|does not|do not|must not|cannot|disabled|unsupported|unacceptable|imply|claim)\b/i

const files = []
const violations = []

walk(root)

checkBackendFolders()
checkSigningBoundary()
checkTransactionBoundary()
checkRawTransactionHelpers()
checkEnvFlag()
checkFullObjectIds()
checkMockDigestBoundary()
checkUnsupportedClaims()

if (violations.length > 0) {
  console.error('Submission safety scan failed:')
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('Submission safety scan passed.')
console.log(`Scanned ${files.length} text files.`)

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    const relPath = normalize(relative(root, fullPath))

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue
      walk(fullPath)
      continue
    }

    if (!entry.isFile()) continue
    if (relPath === 'scripts/verify-submission-safety.mjs') continue
    if (isTextFile(entry.name)) {
      files.push({ path: relPath, source: readFileSync(fullPath, 'utf8') })
    }
  }
}

function checkBackendFolders() {
  for (const dir of listDirs(root)) {
    const name = dir.split('/').at(-1)
    if (backendDirNames.has(name)) {
      violations.push(`forbidden backend/indexer/keeper-like folder found: ${dir}`)
    }
  }
}

function checkSigningBoundary() {
  for (const file of files) {
    for (const pattern of forbiddenSigningPatterns) {
      if (!file.source.includes(pattern)) continue
      if (isTestFile(file.path)) continue
      if (approvedSigningFiles.has(file.path)) continue
      violations.push(`signing API "${pattern}" appears outside approved hook/tests: ${file.path}`)
    }
  }
}

function checkTransactionBoundary() {
  for (const file of files) {
    if (!file.source.includes('new Transaction')) continue
    if (isTestFile(file.path)) continue
    if (approvedTransactionFiles.has(file.path)) continue
    violations.push(`new Transaction appears outside approved builder/tests: ${file.path}`)
  }
}

function checkRawTransactionHelpers() {
  for (const file of files) {
    if (isTestFile(file.path)) continue
    if (!file.path.startsWith('apps/web/src/')) continue

    for (const pattern of ['tx.moveCall', 'coinWithBalance(', 'splitCoins']) {
      if (file.source.includes(pattern)) {
        violations.push(`raw transaction helper "${pattern}" appears in production source: ${file.path}`)
      }
    }
  }
}

function checkEnvFlag() {
  for (const file of files) {
    const basename = file.path.split('/').at(-1)
    if (!basename.startsWith('.env')) continue
    if (/^\s*VITE_ENABLE_LIVE_ADD_COLLATERAL\s*=\s*true\b/m.test(file.source)) {
      violations.push(`committed env enables live Add Collateral: ${file.path}`)
    }
  }
}

function checkFullObjectIds() {
  const fullIdPattern = /0x[a-fA-F0-9]{64}(?!::)/g

  for (const file of files) {
    if (isTestFile(file.path)) continue
    if (!file.path.startsWith('apps/web/src/') && !file.path.startsWith('docs/') && file.path !== 'README.md') continue

    const matches = file.source.match(fullIdPattern) ?? []
    for (const match of matches) {
      if (isObviousPlaceholder(match)) continue
      violations.push(`possible full object ID committed in ${file.path}: ${match.slice(0, 10)}...`)
    }
  }
}

function checkMockDigestBoundary() {
  const resultFile = files.find((file) => file.path === 'apps/web/src/lib/tx/addCollateralResult.ts')
  if (!resultFile) {
    violations.push('result view model file missing from scan')
    return
  }

  if (!resultFile.source.includes("title: 'Mock Rescue Result'")) {
    violations.push('mock result title is not clearly labeled')
  }

  if (!resultFile.source.includes('explorerUrl: undefined')) {
    violations.push('mock/rejected/failed result explorer guard is missing')
  }
}

function checkUnsupportedClaims() {
  for (const file of files) {
    const lines = file.source.split(/\r?\n/)

    lines.forEach((line, index) => {
      const context = lines.slice(Math.max(0, index - 8), index + 1).join(' ')
      for (const pattern of claimPatterns) {
        if (!pattern.test(line)) continue
        if (negationPattern.test(context)) continue
        violations.push(`unsupported protection/automation claim in ${file.path}:${index + 1}: ${line.trim()}`)
      }
    })
  }
}

function listDirs(dir, result = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    const relPath = normalize(relative(root, fullPath))

    if (!entry.isDirectory()) continue
    if (ignoredDirs.has(entry.name)) continue

    result.push(relPath)
    listDirs(fullPath, result)
  }

  return result
}

function isTextFile(filename) {
  if (filename === '.env' || filename.startsWith('.env.')) return true
  const index = filename.lastIndexOf('.')
  if (index === -1) return false

  return textExtensions.has(filename.slice(index))
}

function isTestFile(path) {
  return /\.test\.[tj]sx?$/.test(path)
}

function isObviousPlaceholder(value) {
  const body = value.slice(2).toLowerCase()
  return /^([0-9a-f])\1{63}$/.test(body) || body === '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
}

function normalize(path) {
  return path.replace(/\\/g, '/')
}
