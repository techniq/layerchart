<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { forceSimulation, type Force } from 'd3-force';
  import { chartContext } from './ChartContext.svelte';

  const { data } = chartContext();

  const dispatch = createEventDispatcher<{
    start: null;
    tick: { alpha: number; alphaTarget: number };
    change: null;
    end: null;
  }>();

  // MARK: Public Props

  type Forces = Record<string, Force<any, any>>;
  export let forces: Forces;

  export let alpha: number = 1;
  export let alphaTarget: number = 0;
  export let alphaDecay: number = 1 - Math.pow(0.001, 1 / 300);
  export let alphaMin: number = 0.001;

  export let velocityDecay = 0.4;

  type AlphaResponse = (alpha: number, alphaTarget: number) => number;
  export let alphaResponse: AlphaResponse | undefined = undefined;

  export let stopped = false;

  let _static = false;
  /** If true, will only update nodes after simulation has completed */
  export { _static as static };

  /** Clone data since simulation mutates original */
  export const cloneData: boolean = false;

  // MARK: Private Props

  let nodes: any[] = [];

  const simulation = forceSimulation().stop();

  // d3.Simulation does not provide a `.forces()` getter, so we need to
  // keep track of previous forces ourselves, for diffing against `forces`.
  let previousForces: Forces = {};

  let paused: boolean = true;

  // MARK: Reactivity Effects

  $: {
    // Any time the `stopped` prop gets toggled we
    // update the running state of the simulation:

    if (stopped) {
      pauseDynamicSimulation();
    } else {
      runOrResumeSimulation();
    }
  }

  $: {
    // Any time the `static` prop gets toggled we
    // either attach or detach our internal event listeners:
    if (_static) {
      simulation.on('tick', null).on('end', null);
    } else {
      simulation.on('tick', onTick).on('end', onEnd);
    }

    runOrResumeSimulation();
  }

  $: {
    // Any time the `$data` store gets changed we
    // pass them to the internal d3 simulation object:
    pushNodesToSimulation($data);
    runOrResumeSimulation();
  }

  $: {
    // Any time the `forces` prop gets changed we
    // pass them to the internal d3 simulation object:
    pushForcesToSimulation(forces);
    runOrResumeSimulation();
  }

  $: {
    // Any time the `alpha` prop gets changed we
    // pass it to the internal d3 simulation object:
    pushAlphaToSimulation(alpha);

    // Only resume the simulation as long as `alpha`
    // is above the cut-off threshold of `alphaMin`,
    // otherwise our simulation will never terminate:
    if (simulation.alpha() >= simulation.alphaMin()) {
      runOrResumeSimulation();
    }
  }

  $: {
    // Any time any of the the alpha props get changed we
    // pass them all to the internal d3 simulation object
    // (they are cheap, so passing them as a batch is fine!):

    // We read `simulation.alpha()` instead of `alpha` here, so
    // Svelte does not trigger this block on any change to `alpha`:
    let alphaValue = simulation.alpha();
    if (alphaTarget > alphaValue && alphaValue < alphaMin) {
      // Lift `alpha` from below `alphaMin` in order to give the simulation
      // a chance to get revived if an `alphaTarget > alpha` is provided:
      alphaValue = alphaMin;
    }

    simulation
      .alpha(alphaValue)
      .alphaTarget(alphaTarget)
      .alphaMin(alphaMin)
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay);

    runOrResumeSimulation();
  }

  // MARK: Push State

  function pushAlphaToSimulation(alpha: number) {
    simulation.alpha(alpha);
  }

  function pushNodesToSimulation(nodes: any[]) {
    simulation.nodes(cloneData ? structuredClone(nodes) : nodes);
  }

  function pushForcesToSimulation(forces: Forces) {
    // Evict obsolete forces:
    Object.keys(previousForces).forEach((name) => {
      if (!(name in forces)) {
        simulation.force(name, null);
      }
    });

    // Add new or overwrite existing forces:
    Object.entries(forces).forEach(([name, force]) => {
      if (!(name in previousForces) || force !== previousForces[name]) {
        simulation.force(name, force);
      }
    });

    previousForces = forces;
  }

  // MARK: Pull State

  function pullNodesFromSimulation() {
    nodes = simulation.nodes();
  }

  function pullAlphaFromSimulation() {
    alpha = simulation.alpha();
  }

  // MARK: Resume / Pause

  function runOrResumeSimulation() {
    if (_static) {
      runStaticSimulationToCompletion();
    } else {
      resumeDynamicSimulation();
    }
  }

  function runStaticSimulationToCompletion() {
    if (stopped) {
      // If a simulation is marked as stopped, then it should not get started.
      return;
    }

    if (!_static) {
      // Only static simulations are run to completion.
      return;
    }

    if (!paused) {
      // Pause any possibly still running dynamic simulation:
      pauseDynamicSimulation();
    }

    const ticks = Math.ceil(
      Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
    );

    pushAlphaToSimulation(1.0);

    onStart();

    for (let i = 0; i < ticks; ++i) {
      simulation.tick();
    }

    pullNodesFromSimulation();
    pullAlphaFromSimulation();

    onEnd();
  }

  function resumeDynamicSimulation() {
    if (!paused) {
      // No need to restart an already running simulation.
      return;
    }

    if (stopped) {
      // If a simulation is marked as stopped, then it should not get resumed.
      return;
    }

    if (_static) {
      // Only dynamic simulations can be resumed.
      return;
    }

    onStart();
    simulation.restart();

    // No need to call `onEnd();` for dynamic simulations
    // as the simulation itself takes care of firing `on:end`,
    // which then gets calls `onEnd();` for us.
  }

  function pauseDynamicSimulation() {
    if (paused) {
      // No need to pause an already paused simulation.
      return;
    }

    simulation.stop();
    onEnd();
  }

  // MARK: Event Listeners

  function onStart() {
    if (!paused) {
      // Avoid double-emissions of `start` event due to race conditions.
      return;
    }

    paused = false;
    dispatch('start');
  }

  function onTick() {
    pullNodesFromSimulation();
    pullAlphaFromSimulation();

    dispatch('tick', {
      alpha,
      alphaTarget,
    });
  }

  function onEnd() {
    if (paused) {
      // Avoid double-emissions of `end` event due to race conditions.
      return;
    }

    paused = true;
    dispatch('end');
  }
</script>

<slot {nodes} {simulation} />
