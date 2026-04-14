import createLayout from 'ngraph.forcelayout'
import createGraph from 'ngraph.graph'

type LayoutNode = { id: string }
type LayoutLink = { source: string; target: string }
type LayoutMessage = {
  nodes: LayoutNode[]
  links: LayoutLink[]
  complete?: boolean
  stepsPerFrame?: number
}

type PositionMap = Record<string, { x: number; y: number }>

const workerScope: Worker = self as unknown as Worker

let timeoutId: ReturnType<typeof setTimeout> | null = null
let positions: PositionMap = {}

function stopLoop() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

workerScope.onmessage = ({ data }: MessageEvent<LayoutMessage>) => {
  const { nodes, links, stepsPerFrame = 5 } = data
  stopLoop()

  const graph = createGraph()

  nodes.forEach((node) => graph.addNode(node.id, node))
  links.forEach((link) => graph.addLink(link.source, link.target))

  const layout = createLayout(graph, {
    dimensions: 4,
    springLength: 4,
    springCoefficient: 2,
    dragCoefficient: 1,
    theta: 0,
    gravity: -11,
    timeStep: 0.4,
  })

  for (const id in positions) {
    const p = positions[id]
    const body = layout.getBody(id)
    if (body) {
      body.pos.x = p.x
      body.pos.y = p.y
    }
  }

  function tick() {
    for (let i = 0; i < stepsPerFrame; i++) {
      layout.step()
    }

    positions = {}
    graph.forEachNode((node) => {
      const id = String(node.id)
      const p = layout.getNodePosition(id)
      positions[id] = { x: p.x, y: p.y }
    })

    workerScope.postMessage({ positions })
    timeoutId = setTimeout(tick, 16)
  }

  tick()
}
