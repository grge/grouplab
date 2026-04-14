import type { GraphState, GraphViewState } from '@/groups/types'

const inverse = (g: string) => (g === g.toUpperCase() ? g.toLowerCase() : g.toUpperCase())

export class CayleyGraphKernel {
  readonly generators: string[]
  nodeCount: number
  nodeQueue: number[]
  canonicalNames: number[]
  out: Record<string, Array<number | null>>
  in: Record<string, Array<number | null>>

  constructor(generators: string[], resume?: GraphState) {
    if (resume) {
      this.generators = [...resume.generators]
      this.nodeCount = resume.nodeCount
      this.nodeQueue = [...resume.nodeQueue]
      this.canonicalNames = [...resume.canonicalNames]
      this.out = Object.fromEntries(
        Object.entries(resume.out).map(([g, edges]) => [g, [...edges]]),
      )
      this.in = Object.fromEntries(
        Object.entries(resume.in).map(([g, edges]) => [g, [...edges]]),
      )
      return
    }

    this.generators = [...generators]
    this.nodeCount = 0
    this.nodeQueue = []
    this.canonicalNames = []
    this.out = Object.fromEntries(this.generators.map((g) => [g, []]))
    this.in = Object.fromEntries(this.generators.map((g) => [g, []]))
    this.addNode()
  }

  order(): number {
    let total = 0
    for (let v = 0; v < this.nodeCount; v++) {
      if (this.getCanon(v) === v) total += 1
    }
    return total
  }

  getCanon(v: number): number {
    while (this.canonicalNames[v] !== v) {
      this.canonicalNames[v] = this.canonicalNames[this.canonicalNames[v]]
      v = this.canonicalNames[v]
    }
    return v
  }

  getAdjLists(ch: string): [Array<number | null>, Array<number | null>] {
    const g = ch.toLowerCase()
    if (g === ch) {
      return [this.out[g], this.in[g]]
    }
    return [this.in[g], this.out[g]]
  }

  addNode(): number {
    const v = this.nodeCount
    this.nodeCount += 1
    this.nodeQueue.push(v)
    this.canonicalNames.push(v)
    for (const g of this.generators) {
      this.out[g].push(null)
      this.in[g].push(null)
    }
    return v
  }

  addEdge(v1: number, v2: number, ch: string) {
    v1 = this.getCanon(v1)
    v2 = this.getCanon(v2)
    const [adjList, dualList] = this.getAdjLists(ch)
    adjList[v1] = v2
    dualList[v2] = v1
  }

  traceWord(v: number, word: string, addMissing = false): [number, string] {
    let consumed = 0
    for (const ch of word) {
      const [adjList] = this.getAdjLists(ch)
      let vNext = adjList[this.getCanon(v)]
      if (vNext === null) {
        if (!addMissing) break
        vNext = this.addNode()
        this.addEdge(v, vNext, ch)
      }
      consumed += 1
      v = this.getCanon(vNext)
    }
    return [v, word.slice(consumed)]
  }

  traceLoop(v: number, rel: string) {
    let [vEnd, missing] = this.traceWord(v, rel)
    let vStart: number
    ;[vStart, missing] = this.traceWord(v, rel.slice(rel.length - missing.length).split('').reverse().map(inverse).join(''))

    if (missing) {
      ;[vStart] = this.traceWord(vStart, missing.slice(0, -1), true)
      this.addEdge(vStart, vEnd, missing[missing.length - 1])
    } else if (vStart !== vEnd) {
      this.mergeNodes(vStart, vEnd)
    }
  }

  mergeNodes(v1: number, v2: number) {
    const mergeStack: Array<[number, number]> = [[v1, v2]]

    while (mergeStack.length) {
      let [a, b] = mergeStack.pop()!
      a = this.getCanon(a)
      b = this.getCanon(b)
      if (a === b) continue

      const [w, l] = a < b ? [a, b] : [b, a]
      for (const g of this.generators) {
        for (const ch of [g, g.toUpperCase()]) {
          const [adjList] = this.getAdjLists(ch)
          const wNext = adjList[w]
          const lNext = adjList[l]
          if (lNext !== null && wNext === null) {
            this.addEdge(w, this.getCanon(lNext), ch)
          } else if (lNext !== null && wNext !== null && lNext !== wNext) {
            mergeStack.push([wNext, lNext])
          }
        }
      }
      this.canonicalNames[l] = w
      this.nodeQueue = this.nodeQueue.map((n) => this.getCanon(n)).filter((n, i, arr) => arr.indexOf(n) === i)
    }
  }

  stepNode(relators: string[]): boolean {
    if (!this.nodeQueue.length) return false
    const raw = this.nodeQueue.shift()!
    const v = this.getCanon(raw)

    for (const gen of this.generators) {
      this.traceWord(v, gen, true)
      this.traceWord(v, gen.toUpperCase(), true)
    }
    for (const rel of relators) {
      this.traceLoop(v, rel)
    }
    return this.nodeQueue.length > 0
  }

  exportState(): GraphState {
    return {
      generators: [...this.generators],
      nodeCount: this.nodeCount,
      nodeQueue: [...this.nodeQueue],
      canonicalNames: [...this.canonicalNames],
      out: Object.fromEntries(Object.entries(this.out).map(([g, edges]) => [g, [...edges]])),
      in: Object.fromEntries(Object.entries(this.in).map(([g, edges]) => [g, [...edges]])),
    }
  }

  exportView(): GraphViewState {
    const active = new Set<number>()
    const links = new Map<string, { source: string; target: string; generator: string }>()

    for (let v = 0; v < this.nodeCount; v++) {
      const canon = this.getCanon(v)
      if (canon !== v) continue
      active.add(canon)
    }

    for (const source of active) {
      for (const g of this.generators) {
        const target = this.out[g][source]
        if (target === null) continue
        const canonTarget = this.getCanon(target)
        const key = `${source}:${g}:${canonTarget}`
        links.set(key, {
          source: String(source),
          target: String(canonTarget),
          generator: g,
        })
      }
    }

    return {
      nodes: [...active].sort((a, b) => a - b).map((id) => ({ id: String(id) })),
      links: [...links.values()],
      order: active.size,
    }
  }
}
