import { GraphBuilder } from '@/groups/engine'
import { PresentationGroup } from '@/groups/presentation'

export function computeOrder(generators: string[], relations: string[]): number {
  const group = new PresentationGroup({ generators, relations })
  const builder = new GraphBuilder(group)
  builder.run()
  return builder.order
}
