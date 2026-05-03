const BYTE_UNITS = ['o', 'Ko', 'Mo', 'Go', 'To']
const BYTE_UNITS_SHORT = ['', 'K', 'M', 'G', 'T']

export function formatBytes(bytes: number, short = false): string {
  if (bytes <= 0) return short ? '0' : '0 o'
  const units = short ? BYTE_UNITS_SHORT : BYTE_UNITS
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  const decimals = index === 0 ? 0 : index <= 2 ? 0 : 1
  return short ? `${value.toFixed(decimals)}${units[index]}` : `${value.toFixed(decimals)} ${units[index]}`
}

export function formatCpu(vcpu: number): string {
  return `${vcpu.toFixed(2)} vCPU`
}

export function formatPercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export function formatChartValue(value: number, unit: string, formatFn?: (v: number) => string): string {
  if (formatFn) return formatFn(value)
  if (unit === 'bytes') return formatBytes(value)
  if (unit === 'vcpu') return formatCpu(value)
  if (unit === '%') return `${value.toFixed(1)}%`
  return value.toFixed(2)
}
