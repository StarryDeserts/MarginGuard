import { describe, expect, it } from 'vitest'
import { getDeepBookPoolConfig } from './poolKeys'
import { verifyMarginManagerType } from './typeVerification'

const poolConfig = getDeepBookPoolConfig('mainnet')
const expectedBaseCoinType = poolConfig.status === 'configured' ? poolConfig.baseCoinType : '0x2::sui::SUI'
const expectedQuoteCoinType =
  poolConfig.status === 'configured'
    ? poolConfig.quoteCoinType
    : '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

function managerType(base: string, quote: string) {
  return `0xabc::margin_manager::MarginManager<${base}, ${quote}>`
}

describe('MarginManager type verification', () => {
  it('classifies exact MarginManager<SUI, USDC> as a verified match', () => {
    const result = verifyMarginManagerType({
      actualType: managerType(expectedBaseCoinType, expectedQuoteCoinType),
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('match')
  })

  it('classifies reversed MarginManager<USDC, SUI> as pair-unverified', () => {
    const result = verifyMarginManagerType({
      actualType: managerType(expectedQuoteCoinType, expectedBaseCoinType),
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('margin-manager-pair-unverified')
  })

  it('classifies MarginManager<SUI, other quote> as pair-mismatch', () => {
    const result = verifyMarginManagerType({
      actualType: managerType(expectedBaseCoinType, '0x999::fake_usdc::FAKE_USDC'),
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('pair-mismatch')
  })

  it('classifies unrelated object types as not-margin-manager', () => {
    const result = verifyMarginManagerType({
      actualType: `0x2::coin::Coin<${expectedBaseCoinType}>`,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('not-margin-manager')
  })

  it('handles whitespace variants', () => {
    const result = verifyMarginManagerType({
      actualType: `0xabc::margin_manager::MarginManager<
        ${expectedBaseCoinType},
        ${expectedQuoteCoinType}
      >`,
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('match')
  })

  it('normalizes address case and short SUI address variants', () => {
    const quoteWithUppercaseAddress = expectedQuoteCoinType.replace(/^0x[0-9a-f]+/i, (address) => address.toUpperCase())
    const result = verifyMarginManagerType({
      actualType: managerType('0x2::sui::SUI', quoteWithUppercaseAddress),
      expectedBaseCoinType,
      expectedQuoteCoinType,
    })

    expect(result.status).toBe('match')
  })
})
