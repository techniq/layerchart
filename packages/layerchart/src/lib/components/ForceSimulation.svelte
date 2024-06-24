<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';

  import { forceSimulation, type Force } from 'd3-force';

  const { data } = getContext('LayerCake');

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

  // Only dynamic simulations distinguish between paused and running state.
  // Invariant: Static simulations always keep `paused = true`.
  let paused: boolean = true;

  // MARK: Reactivity Effects

  $: {
    // Any time the `stopped` prop gets toggled we
    // update the running state of the simulation:

    if (stopped) {
      if (!isStatic()) {
        pauseDynamicSimulation();
      }
    } else {
      if (isStatic()) {
        if (!isPaused()) {
          pauseDynamicSimulation();
        }
        runStaticSimulation();
      } else {
        resumeDynamicSimulation();
      }
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
  }

  $: {
    // Any time the `$data` store gets changed we
    // pass them to the internal d3 simulation object:

    pushNodesToSimulation(nodes);

    if (isStatic()) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation();
    }
  }

  $: {
    // Any time the `forces` prop gets changed we
    // pass them to the internal d3 simulation object:

    pushForcesToSimulation(forces);

    if (isStatic()) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation();
    }
  }

  $: {
    // Any time the `alpha` prop gets changed we
    // pass it to the internal d3 simulation object:

    pushAlphaToSimulation(alpha);

    if (isStatic()) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation(alpha);
    }
  }

  $: {
    // Any time any of the the alpha props get changed we
    // pass them all to the internal d3 simulation object
    // (they are cheap, so passing them as a batch is fine!):

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

    if (isStatic()) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation();
    }
  }

  // MARK: Push State

  function pushAlphaToSimulation(alpha: number) {
    simulation.alpha(alpha);
  }

  function pushNodesToSimulation(nodes: any[]) {
    simulation.nodes(cloneData ? structuredClone(nodes) : nodes);
  }

  function pushForcesToSimulation(forces: Forces) {

    Object.entries(forces).forEach(([name, force]) => {
      simulation.force(name, force);
    });
  }

  // MARK: Pull State

  function pullNodesAndAlphaFromSimulation() {
    nodes = simulation.nodes();
    alpha = simulation.alpha();
  }

  function pullAlphaFromSimulation() {
    alpha = simulation.alpha();
  }

  // MARK: Resume / Pause

  function runStaticSimulation() {
    if (stopped) {
      return;
    }

    if (!_static) {
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
      pullAlphaFromSimulation();
    }

    onEnd();
  }

  function resumeDynamicSimulation(alpha: number | undefined = undefined) {
    if (stopped) {
      return;
    }

    if (_static) {
      return;
    }

    if (alpha) {
      pushAlphaToSimulation(alpha);
    }

    if (paused) {
      onStart();
      simulation.restart();
      paused = false;

      // No need to call `onEnd();` for dynamic simulations
      // as the simulation itself takes care of firing `on:end`,
      // which then gets calls `onEnd();` for us.
    }
  }

  function pauseDynamicSimulation() {
    if (!paused) {
      paused = true;
      simulation.stop();
      onEnd();
    }
  }

  // MARK: Event Listeners

  function onStart() {
    dispatch('start');
  }

  function onTick() {
    pullNodesAndAlphaFromSimulation();

    dispatch('tick', {
      alpha,
      alphaTarget,
    });

    if (simulation.alpha() < simulation.alphaMin()) {
      pauseDynamicSimulation();
    }
  }

  function onEnd() {
    pullNodesAndAlphaFromSimulation();

    dispatch('end');
  }

  // MARK: Utilities

  function isStatic(): boolean {
    return _static;
  }

  function isPaused(): boolean {
    return paused;
  }
</script>

<slot {nodes} {simulation} />
