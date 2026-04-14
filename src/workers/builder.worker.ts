import { PresentationGroup, type Relation } from '@/groups/presentation'
import { GraphBuilder } from '@/groups/engine'
import type { GraphState, GraphViewState } from '@/groups/types'

type StartMessage = {
  action: 'start'
  generators: string[]
  relations: Relation[]
  subgroupGenerators: string[]
  savedState?: GraphState
  nodeLimit: number
}

type StopMessage = { action: 'stop' }
type IncomingMessage = StartMessage | StopMessage

type BuilderUpdateMessage = {
  state: GraphState
  view: GraphViewState
  completed: boolean
  paused: boolean
  err: string | null
}

type WorkerStateMessage = {
  workerState: 'idle' | 'running' | 'stopped'
}

type OutgoingMessage = BuilderUpdateMessage | WorkerStateMessage

const workerScope: Worker = self as unknown as Worker

let builder: GraphBuilder | null = null
let intervalId: number | null = null
let nodeLimit = 100

const STEP_BATCH = 20
const POST_EVERY = 10
let lastPost = 0

function reviveGroup(generators: string[], relations: Relation[]): PresentationGroup {
  return new PresentationGroup({ generators, relations })
}

function post(message: OutgoingMessage) {
  workerScope.postMessage(message)
}

function setWorkerState(state: 'idle' | 'running' | 'stopped') {
  post({ workerState: state })
}

function emptyState(generators: string[]): GraphState {
  return {
    generators,
    nodeCount: 0,
    nodeQueue: [],
    canonicalNames: [],
    out: Object.fromEntries(generators.map((g) => [g, []])),
    in: Object.fromEntries(generators.map((g) => [g, []])),
  }
}

function emptyView(): GraphViewState {
  return {
    nodes: [],
    links: [],
    order: 0,
  }
}

function tick() {
  if (!builder) return

  let steps = 0
  while (steps < STEP_BATCH && builder.step()) {
    steps++
  }

  const now = performance.now()
  const state = builder.exportState()
  const view = builder.exportView()
  const completed = builder.isFinished
  const paused = !completed && view.nodes.length >= nodeLimit

  if (completed || paused || now - lastPost > POST_EVERY) {
    post({ state, view, completed, paused, err: null })
    lastPost = now
  }

  if (completed || paused) {
    cleanup('idle')
  }
}

function cleanup(nextState: 'idle' | 'running' | 'stopped' = 'idle') {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  setWorkerState(nextState)
}

workerScope.addEventListener('message', (e: MessageEvent<IncomingMessage>) => {
  const msg = e.data

  if (msg.action === 'stop') {
    cleanup('idle')
    builder = null
    return
  }

  try {
    const pg = reviveGroup(msg.generators, msg.relations)
    builder = new GraphBuilder(pg, msg.subgroupGenerators, msg.savedState)
    nodeLimit = msg.nodeLimit || 100
    lastPost = performance.now()
    cleanup('running')
    intervalId = self.setInterval(tick, 0)
  } catch (err) {
    post({
      state: msg.savedState ?? emptyState(msg.generators),
      view: emptyView(),
      completed: false,
      paused: false,
      err: err instanceof Error ? err.message : String(err),
    })
    cleanup('idle')
  }
})
