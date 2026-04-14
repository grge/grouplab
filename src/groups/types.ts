export interface GraphState {
  generators: string[]
  nodeCount: number
  nodeQueue: number[]
  canonicalNames: number[]
  out: Record<string, Array<number | null>>
  in: Record<string, Array<number | null>>
}

export interface GraphViewNode {
  id: string
}

export interface GraphViewLink {
  source: string
  target: string
  generator: string
}

export interface GraphViewState {
  nodes: GraphViewNode[]
  links: GraphViewLink[]
  order: number
}
