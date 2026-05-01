import { describe, expect, it } from 'vitest'
import { demoSteps } from './scenarios'

describe('demo scenario step copy', () => {
  it('labels the warning step as simulated so it is not confused with a real no-debt baseline', () => {
    const warningStep = demoSteps.find((step) => step.id === 'RISK_WARNING')

    expect(warningStep?.title).toBe('Simulated Risk Warning')
    expect(warningStep?.description.toLowerCase()).toContain('simulated')
  })
})
