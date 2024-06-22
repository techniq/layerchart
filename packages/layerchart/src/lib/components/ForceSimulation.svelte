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

  const simulation = forceSimulation().stop(); //.nodes(nodesFromData());

  // Only dynamic simulations distinguish between paused and running state.
  // Invariant: Static simulations always keep `paused = true`.
  let paused: boolean = true;

  // MARK: Reactivity Triggers

  $: {
    // Any time the `stopped` prop gets toggled we
    // update the running state of the simulation:
    updateStateOnChangeOf({
      stopped,
      _static,
    });
  }

  $: {
    // Any time the `static` prop gets toggled we
    // either attach or detach our internal event listeners:
    updateEventListenersOnChangeOf({ _static });
  }

  $: {
    // Any time the `$data` store gets changed we
    // pass them to the internal d3 simulation object:
    updateNodesOnChangeOf({ data: $data });
  }

  $: {
    // Any time the `forces` prop gets changed we
    // pass them to the internal d3 simulation object:
    updateForcesOnChangeOf({ forces });
  }

  $: {
    // Any time the `alpha` prop gets changed we
    // pass it to the internal d3 simulation object:
    updateAlphaOnChangeOf({ alpha });
  }

  $: {
    // Any time any of the the alpha props get changed we
    // pass them all to the internal d3 simulation object
    // (they are cheap, so passing them as a batch is fine!):
    updateSettingsOnChangeOf({
      alphaTarget,
      alphaMin,
      alphaDecay,
      velocityDecay,
      _static,
    });
  }

  // MARK: Reactivity Behaviors

  function updateEventListenersOnChangeOf(args: { _static: boolean }) {
    const { _static } = args;

    pushEventListenersToSimulation({ _static });
  }

  function updateStateOnChangeOf(args: { stopped: boolean; _static: boolean }) {
    const { stopped } = args;

    if (stopped) {
      if (!_static) {
        pauseDynamicSimulation();
      }
    } else {
      if (_static) {
        if (!paused) {
          pauseDynamicSimulation();
        }
        runStaticSimulation();
      } else {
        resumeDynamicSimulation();
      }
    }
  }

  function updateAlphaOnChangeOf(args: { alpha: number }) {
    const { alpha } = args;

    pushAlphaToSimulation({ alpha });

    if (_static) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation(alpha);
    }
  }

  function updateSettingsOnChangeOf(args: {
    alphaTarget: number;
    alphaMin: number;
    alphaDecay: number;
    velocityDecay: number;
    _static: boolean;
  }) {
    const { alphaTarget, alphaMin, alphaDecay, velocityDecay, _static } = args;

    pushSettingsToSimulation({ alphaTarget, alphaMin, alphaDecay, velocityDecay, _static });

    if (_static) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation();
    }
  }

  function updateNodesOnChangeOf(args: { data: any[] }) {
    const { data } = args;

    pushNodesToSimulation({ nodes: data });

    if (_static) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation();
    }
  }

  function updateForcesOnChangeOf(args: { forces: Forces }) {
    const { forces } = args;

    pushForcesToSimulation({ forces });

    if (_static) {
      runStaticSimulation();
    } else {
      resumeDynamicSimulation();
    }
  }

  // MARK: Push State

  function pushEventListenersToSimulation(args: { _static: boolean }) {
    const { _static } = args;

    if (_static) {
      simulation.on('tick', null).on('end', null);
    } else {
      simulation.on('tick', onTick).on('end', onEnd);
    }
  }

  function pushSettingsToSimulation(args: {
    alphaTarget: number;
    alphaMin: number;
    alphaDecay: number;
    velocityDecay: number;
    _static: boolean;
  }) {
    const { alphaTarget, alphaMin, alphaDecay, velocityDecay, _static } = args;

    let alpha = simulation.alpha();
    if (alphaTarget > alpha && alpha < alphaMin) {
      // Lift `alpha` from below `alphaMin` in order to give the simulation
      // a chance to get revived if an `alphaTarget > alpha` is provided:
      alpha = alphaMin;
    }

    simulation
      .alpha(alpha)
      .alphaTarget(alphaTarget)
      .alphaMin(alphaMin)
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay);
  }

  function pushAlphaToSimulation(args: { alpha: number }) {
    const { alpha } = args;

    simulation.alpha(alpha);
  }

  function pushNodesToSimulation(args: { nodes: any[] }) {
    const { nodes } = args;

    simulation.nodes(cloneData ? structuredClone(nodes) : nodes);
  }

  function pushForcesToSimulation(args: { forces: Forces }) {
    const { forces } = args;

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

    pushAlphaToSimulation({ alpha: 1 });

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
      pushAlphaToSimulation({ alpha });
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
</script>

<slot {nodes} {simulation} />
