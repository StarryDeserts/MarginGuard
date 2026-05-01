import type { AppNetwork, MarginManagerRef } from '../../types/margin'

export const LOCAL_MANAGERS_KEY = 'marginguard:v0:localManagers'
export const LAST_NETWORK_KEY = 'marginguard:v0:lastNetwork'
export const DEMO_PREFS_KEY = 'marginguard:v0:demoPrefs'

export type LocalManagerRecord = MarginManagerRef & {
  label?: string
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function getStorage(): StorageLike | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage
}

export function isValidObjectId(value: string) {
  return /^0x[a-fA-F0-9]{8,64}$/.test(value.trim())
}

export function parseLocalManagers(raw: string | null): LocalManagerRecord[] {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isLocalManagerRecord)
  } catch {
    return []
  }
}

function isLocalManagerRecord(value: unknown): value is LocalManagerRecord {
  if (!value || typeof value !== 'object') return false

  const record = value as Partial<LocalManagerRecord>

  return (
    typeof record.objectId === 'string' &&
    isValidObjectId(record.objectId) &&
    record.poolKey === 'SUI_USDC' &&
    record.displayPair === 'SUI/USDC' &&
    (record.network === 'mainnet' || record.network === 'testnet')
  )
}

export function readLocalManagers(storage = getStorage()): LocalManagerRecord[] {
  return parseLocalManagers(storage?.getItem(LOCAL_MANAGERS_KEY) ?? null)
}

export function writeLocalManagers(records: LocalManagerRecord[], storage = getStorage()) {
  storage?.setItem(LOCAL_MANAGERS_KEY, JSON.stringify(records))
}

export function readLastNetwork(storage = getStorage()): AppNetwork {
  const value = storage?.getItem(LAST_NETWORK_KEY)

  return value === 'testnet' ? 'testnet' : 'mainnet'
}

export function writeLastNetwork(network: AppNetwork, storage = getStorage()) {
  storage?.setItem(LAST_NETWORK_KEY, network)
}

export function clearLocalManagers(storage = getStorage()) {
  storage?.removeItem(LOCAL_MANAGERS_KEY)
}

export function clearDemoPrefs(storage = getStorage()) {
  storage?.removeItem(DEMO_PREFS_KEY)
}

export function createLocalManagerRecord(input: {
  objectId: string
  network: AppNetwork
  label?: string
  nowMs?: number
}): LocalManagerRecord {
  const nowMs = input.nowMs ?? Date.now()

  return {
    objectId: input.objectId.trim(),
    poolKey: 'SUI_USDC',
    displayPair: 'SUI/USDC',
    network: input.network,
    label: input.label,
    addedAtMs: nowMs,
    lastUsedAtMs: nowMs,
  }
}

export function upsertLocalManager(records: LocalManagerRecord[], record: LocalManagerRecord): LocalManagerRecord[] {
  const previous = records.find((item) => item.objectId === record.objectId && item.network === record.network)
  const merged = {
    ...previous,
    ...record,
    addedAtMs: previous?.addedAtMs ?? record.addedAtMs,
    lastUsedAtMs: record.lastUsedAtMs ?? Date.now(),
  }

  return [merged, ...records.filter((item) => !(item.objectId === record.objectId && item.network === record.network))]
}
