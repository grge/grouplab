import { PresentationGroup, GraphBuilder } from '@/utils/core';
import type { Relation, GraphState } from '@/utils/core';

declare const self: DedicatedWorkerGlobalScope // TS hint

type StartMessage = {
  action: 'start',
  generators: string[],
  relations: Relation[],
  subgroupGenerators: string[],
  savedState?: GraphState,
  nodeLimit: number
}
type StopMessage = { action: 'stop' }
type IncomingMessage = StartMessage | StopMessage

type OutgoingMessage =
| { state: GraphState, completed: boolean, paused: boolean, err: null }
  { workerState: 'idle' | 'running' | 'stopped' }

/* -------------- global state -------------- */

let builder: GraphBuilder | null = null
let intervalId: number | null = null;
let nodeLimit = 100

const STEP_BATCH = 20; // steps per tick
const POST_EVERY = 10; // ms throttle for postMessage
let lastPost = 0;

/* -------------- helper functions -------------- */

function reviveGroup(generators, relations) {
  return new PresentationGroup({
    generators: generators as string[],
    relations: relations as Relation[],
  });
}

function post(o : OutgoingMessage) {
  self.postMessage(o);
}

function setWorkerState(state: 'idle' | 'running' | 'stopped') {
  post({ workerState: state });
}

/* -------------- ticking loop -------------- */

function tick() {
  if (!builder) return;
  let steps = 0
  while (steps < STEP_BATCH && builder.step()) { steps++; }
  const now = performance.now()
  const state = builder.exportState()
  const completed = builder.unfinished.length === 0;
  const paused = (!completed) && builder.outEdges.size >= 300

  if (completed || paused || now - lastPost > POST_EVERY) {
    post({ state, completed, paused, err: null })
    lastPost = now
  }

  if (completed || paused) {
    cleanup('idle')
  }
}

function cleanup(nextState: 'idle' | 'running' = 'idle') {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  setWorkerState(nextState);
}

/* -------------- message handling -------------- */

self.addEventListener('message', (e: MessageEvent<IncomingMessage>) => {
  const msg = e.data;

  if (msg.action === 'stop') {
    cleanup('idle')
    builder = null;
    return
  }

  try {
    const pg = reviveGroup(msg.generators, msg.relations);
    builder = new GraphBuilder(pg, msg.subgroupGenerators, msg.savedState);
    nodeLimit += msg.nodeLimit || 100;
    lastPost = performance.now();
    cleanup('running');
    intervalId = setInterval(tick, 0); // start ticking
  } catch (err) {
    post({ state: msg.savedState!, completed: false, paused: false, err: err })
    cleanup('idle');
  }
})
