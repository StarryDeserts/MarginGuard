export function shortAddress(value: string) {
  if (value.includes('...')) {
    return value
  }

  if (value.length <= 12) {
    return value
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export function redactObjectIds(value: string) {
  return value.replace(/0x[a-fA-F0-9]{13,}/g, (match) => shortAddress(match))
}
