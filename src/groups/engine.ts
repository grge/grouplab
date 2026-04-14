import type { GraphState, GraphViewState } from '@/groups/types'
import type { PresentationGroup } from '@/groups/presentation'
import { CayleyGraphKernel } from '@/groups/kernel'

export class GraphBuilder {
  readonly G: PresentationGroup
  readonly kernel: CayleyGraphKernel
  private subgroupGenerators: string[]

  constructor(group: PresentationGroup, subgroupGenerators: string[] = [], resume?: GraphState) {
    this.G = group
    this.subgroupGenerators = subgroupGenerators
    this.kernel = new CayleyGraphKernel(group.generators, resume)

    if (!resume) {
      for (const subgen of subgroupGenerators) {
        this.kernel.traceLoop(0, subgen)
      }
    }
  }

  get isFinished(): boolean {
    return this.kernel.nodeQueue.length === 0
  }

  get order(): number {
    return this.kernel.order()
  }

  step(): boolean {
    return this.kernel.stepNode(this.G.relators)
  }

  run(max = Infinity) {
    let s = 0
    while (s < max && this.step()) ++s
    return this.kernel.nodeQueue.length
  }

  exportState(): GraphState {
    return this.kernel.exportState()
  }

  exportView(): GraphViewState {
    return this.kernel.exportView()
  }

  static importState(pg: PresentationGroup, subgroupGenerators: string[], state: GraphState) {
    return new GraphBuilder(pg, subgroupGenerators, state)
  }
}
