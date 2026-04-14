export interface PresText {
  g: string
  r: string
}

function compactField(text: string): string {
  return text.replace(/\s+/g, '').trim()
}

export function encodePres(pres: PresText): string {
  const g = compactField(pres.g)
  const r = compactField(pres.r)
  return `${g}_${r}`
}

export function decodePres(str: string): PresText | null {
  const idx = str.indexOf('_')
  if (idx === -1) {
    const gOnly = str.trim()
    return gOnly ? { g: gOnly, r: '' } : null
  }

  const g = str.slice(0, idx).trim()
  const r = str.slice(idx + 1).trim()
  if (!g) return null
  return { g, r }
}
