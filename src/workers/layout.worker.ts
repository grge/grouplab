import createLayout from 'ngraph.forcelayout'
import createGraph from 'ngraph.graph'

let layout: ReturnType<typeof createLayout> | null = null
let graph: ReturnType<typeof ngraph> | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null
let positions: Record<string, { x: number; y: number }> = {}

function stopLoop() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

self.onmessage = ({data}) => {
  const { nodes, links, complete, stepsPerFrame } = data
  stopLoop()

  graph = createGraph()
  let totalSteps = 0

  nodes.forEach(node => graph.addNode(node.id, node))
  links.forEach(link => graph.addLink(link.source, link.target))

  layout = createLayout(graph, {
    dimensions: 4,
    springLength: 4,
    springCoefficient: 2,
    dragCoefficient: 1,
    theta: 0,
    gravity: -11,
    timeStep: 0.4
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
    // update the physics rules
    for (let i = 0; i < 5; i++) {
      layout.step()
      totalSteps++
    }
    positions = {}
    graph!.forEachNode((node) => {
      const p = layout.getNodePosition(node.id)
      positions[node.id] = { x: p.x, y: p.y }
    })
    self.postMessage({ positions })
    setTimeout(tick, 16)
  }
  tick()
}
