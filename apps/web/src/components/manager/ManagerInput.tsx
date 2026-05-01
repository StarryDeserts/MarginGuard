import { useState } from 'react'
import type { AppNetwork } from '../../types/margin'
import { isValidObjectId } from '../../lib/storage/localManagers'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

type ManagerInputProps = {
  network: AppNetwork
  onNetworkChange: (network: AppNetwork) => void
  onSave: (input: { objectId: string; network: AppNetwork; label?: string }) => void
}

export function ManagerInput({ network, onNetworkChange, onSave }: ManagerInputProps) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const trimmedValue = value.trim()
  const isValid = isValidObjectId(trimmedValue)
  const showError = touched && trimmedValue.length > 0 && !isValid

  function submit() {
    setTouched(true)
    if (!isValid) return

    onSave({ objectId: trimmedValue, network, label: 'SUI/USDC manual import' })
    setValue('')
    setTouched(false)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-text-secondary">
        Margin Manager ID
        <Input
          className="mt-2"
          value={value}
          error={showError}
          placeholder="0x1234abcd..."
          onBlur={() => setTouched(true)}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      {showError ? <p className="text-sm text-danger-red">Invalid manager ID. Use 0x followed by hex characters only.</p> : null}
      <label className="block text-sm font-medium text-text-secondary">
        Network
        <Select className="mt-2" value={network} onChange={(event) => onNetworkChange(event.target.value as AppNetwork)}>
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
        </Select>
      </label>
      <label className="block text-sm font-medium text-text-secondary">
        Market
        <Select className="mt-2" value="SUI_USDC" onChange={() => undefined}>
          <option value="SUI_USDC">SUI/USDC Margin Manager</option>
        </Select>
      </label>
      <Button type="button" className="w-full" disabled={!isValid} onClick={submit}>
        Save Manager Locally
      </Button>
    </div>
  )
}
