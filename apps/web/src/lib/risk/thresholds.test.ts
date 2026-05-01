import { describe, expect, it } from 'vitest'
import { classifyRisk } from './thresholds'

describe('classifyRisk', () => {
  it('classifies all threshold bands', () => {
    expect(classifyRisk(1.3)).toBe('healthy')
    expect(classifyRisk(1.25)).toBe('guarded')
    expect(classifyRisk(1.2)).toBe('caution')
    expect(classifyRisk(1.17)).toBe('warning')
    expect(classifyRisk(1.1)).toBe('liquidatable')
  })
})
