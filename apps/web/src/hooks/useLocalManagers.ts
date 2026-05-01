import { useMemo, useState } from 'react'
import type { AppNetwork } from '../types/margin'
import {
  clearLocalManagers,
  createLocalManagerRecord,
  readLastNetwork,
  readLocalManagers,
  upsertLocalManager,
  writeLastNetwork,
  writeLocalManagers,
  type LocalManagerRecord,
} from '../lib/storage/localManagers'

export function useLocalManagers() {
  const [records, setRecords] = useState<LocalManagerRecord[]>(() => readLocalManagers())
  const [network, setNetworkState] = useState<AppNetwork>(() => readLastNetwork())
  const activeManager = useMemo(() => records[0], [records])

  function persist(nextRecords: LocalManagerRecord[]) {
    setRecords(nextRecords)
    writeLocalManagers(nextRecords)
  }

  function save(input: { objectId: string; network: AppNetwork; label?: string }) {
    const record = createLocalManagerRecord(input)
    const next = upsertLocalManager(records, record)
    persist(next)
    setNetwork(input.network)

    return record
  }

  function select(objectId: string, selectedNetwork = network) {
    const now = Date.now()
    const next = records
      .map((record) =>
        record.objectId === objectId && record.network === selectedNetwork ? { ...record, lastUsedAtMs: now } : record,
      )
      .sort((a, b) => (b.lastUsedAtMs ?? 0) - (a.lastUsedAtMs ?? 0))

    persist(next)
  }

  function remove(objectId: string, selectedNetwork?: AppNetwork) {
    persist(records.filter((item) => !(item.objectId === objectId && (!selectedNetwork || item.network === selectedNetwork))))
  }

  function clear() {
    setRecords([])
    clearLocalManagers()
  }

  function setNetwork(nextNetwork: AppNetwork) {
    setNetworkState(nextNetwork)
    writeLastNetwork(nextNetwork)
  }

  return { records, activeManager, network, save, select, remove, clear, setNetwork }
}
