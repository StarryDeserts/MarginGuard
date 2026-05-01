export type MarginManagerTypeVerificationStatus =
  | 'match'
  | 'margin-manager-pair-unverified'
  | 'not-margin-manager'
  | 'pair-mismatch'

export type MarginManagerTypeVerificationResult = {
  status: MarginManagerTypeVerificationStatus
  reason: string
  actualType?: string
  expectedBaseCoinType: string
  expectedQuoteCoinType: string
}

type VerifyMarginManagerTypeInput = {
  actualType?: string
  expectedBaseCoinType: string
  expectedQuoteCoinType: string
}

const MARGIN_MANAGER_SHADOW = '::margin_manager::marginmanager<'

export function verifyMarginManagerType(input: VerifyMarginManagerTypeInput): MarginManagerTypeVerificationResult {
  const expectedBaseCoinType = normalizeMoveTypeForCompare(input.expectedBaseCoinType)
  const expectedQuoteCoinType = normalizeMoveTypeForCompare(input.expectedQuoteCoinType)

  if (!input.actualType) {
    return {
      status: 'not-margin-manager',
      reason: 'Object type was unavailable.',
      actualType: input.actualType,
      expectedBaseCoinType: input.expectedBaseCoinType,
      expectedQuoteCoinType: input.expectedQuoteCoinType,
    }
  }

  const normalizedActualType = normalizeMoveTypeForCompare(input.actualType)
  const shadowType = normalizedActualType.toLowerCase()

  if (!shadowType.includes(MARGIN_MANAGER_SHADOW)) {
    return {
      status: 'not-margin-manager',
      reason: 'Object type does not contain margin_manager::MarginManager.',
      actualType: input.actualType,
      expectedBaseCoinType: input.expectedBaseCoinType,
      expectedQuoteCoinType: input.expectedQuoteCoinType,
    }
  }

  const genericArgs = extractMarginManagerGenericArgs(normalizedActualType)

  if (!genericArgs || genericArgs.length < 2) {
    return {
      status: 'margin-manager-pair-unverified',
      reason: 'Object is a MarginManager, but generic pair arguments could not be parsed conclusively.',
      actualType: input.actualType,
      expectedBaseCoinType: input.expectedBaseCoinType,
      expectedQuoteCoinType: input.expectedQuoteCoinType,
    }
  }

  const [firstArg, secondArg] = genericArgs
  const hasExpectedBase = genericArgs.includes(expectedBaseCoinType)
  const hasExpectedQuote = genericArgs.includes(expectedQuoteCoinType)

  if (firstArg === expectedBaseCoinType && secondArg === expectedQuoteCoinType) {
    return {
      status: 'match',
      reason: 'Object type exactly matches MarginManager<SUI, USDC>.',
      actualType: input.actualType,
      expectedBaseCoinType: input.expectedBaseCoinType,
      expectedQuoteCoinType: input.expectedQuoteCoinType,
    }
  }

  if (hasExpectedBase && hasExpectedQuote) {
    return {
      status: 'margin-manager-pair-unverified',
      reason: 'Object is a MarginManager and contains SUI and USDC, but generic order is not the verified SUI/USDC order.',
      actualType: input.actualType,
      expectedBaseCoinType: input.expectedBaseCoinType,
      expectedQuoteCoinType: input.expectedQuoteCoinType,
    }
  }

  return {
    status: 'pair-mismatch',
    reason: 'Object is a MarginManager, but its generic pair is not the configured SUI/USDC pair.',
    actualType: input.actualType,
    expectedBaseCoinType: input.expectedBaseCoinType,
    expectedQuoteCoinType: input.expectedQuoteCoinType,
  }
}

export function normalizeMoveTypeForCompare(type: string) {
  return type.replace(/\s+/g, '').replace(/0x[0-9a-fA-F]+/gi, normalizeSuiAddressForTypeCompare)
}

function normalizeSuiAddressForTypeCompare(address: string) {
  const hex = address.slice(2).toLowerCase().replace(/^0+/, '') || '0'

  return `0x${hex.padStart(64, '0')}`
}

function extractMarginManagerGenericArgs(normalizedType: string) {
  const shadowType = normalizedType.toLowerCase()
  const marginManagerIndex = shadowType.indexOf(MARGIN_MANAGER_SHADOW)

  if (marginManagerIndex === -1) return null

  const genericStart = normalizedType.indexOf('<', marginManagerIndex)
  if (genericStart === -1) return null

  const args: string[] = []
  let depth = 0
  let current = ''

  for (let index = genericStart + 1; index < normalizedType.length; index += 1) {
    const char = normalizedType[index]

    if (char === '<') {
      depth += 1
      current += char
      continue
    }

    if (char === '>') {
      if (depth === 0) {
        if (current) args.push(current)
        return args
      }

      depth -= 1
      current += char
      continue
    }

    if (char === ',' && depth === 0) {
      args.push(current)
      current = ''
      continue
    }

    current += char
  }

  return null
}
