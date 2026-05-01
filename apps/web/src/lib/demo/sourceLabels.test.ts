import { describe, expect, it } from 'vitest'
import { RESCUE_SIMULATOR_SOURCE_NOTICE } from './sourceLabels'

describe('demo source labels', () => {
  it('describes Rescue Simulator as hybrid real-baseline plus estimates', () => {
    expect(RESCUE_SIMULATOR_SOURCE_NOTICE).toContain('Real DeepBook baseline')
    expect(RESCUE_SIMULATOR_SOURCE_NOTICE).toContain('simulated fallback')
    expect(RESCUE_SIMULATOR_SOURCE_NOTICE).toContain('never opens a wallet prompt from simulated state')
  })
})
