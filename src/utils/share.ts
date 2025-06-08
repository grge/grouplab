export interface PresJSON {
  g: string[],
  r: string[]
}

export function encodePres(pres: PresJSON): string {
  const g = pres.g.join(',')
  const r = pres.r.join(',')
  return `${g}_${r}`
}

export function decodePres(str: string): PresJSON {
  const [gPart, rPart] = str.split('_')
  if (!gPart) { return null }
  return {
    g: gPart.split(',').filter(Boolean),
    r: rPart ? rPart.split(',').filter(Boolean) : []
  }
}
