<script lang="ts" module>
  import { forceSimulation, type Force, type Simulation, type SimulationNodeDatum } from 'd3-force';
  import type { Snippet } from 'svelte';

  type Forces = Record<string, Force<any, any>>;

  export type LinkPosition = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

  export type ForceSimulationProps = {
    /**
     * Force simulation parameters
     */
    forces: Forces;

    /**
     * An array of links to be used for position calculation.
     */
    links?: any[];

    /**
     * Current alpha value of the simulation
     * @default 1
     */
    alpha?: number;

    /**
     * Target alpha value for the simulation
     * @default 0
     */
    alphaTarget?: number;

    /**
     * Alpha decay rate per tick
     * @default 1 - Math.pow(0.001, 1 / 300)
     */
    alphaDecay?: number;

    /**
     * Minimum alpha value at which simulation stops
     * @default 0.01
     */
    alphaMin?: number;

    /**
     * Velocity decay factor applied to nodes each tick
     * @default 0.4
     */
    velocityDecay?: number;

    /**
     * Stop simulation
     * @default false
     */
    stopped?: boolean;

    /**
     * If true, will only update nodes after simulation has completed
     * @default false
     */
    static?: boolean;

    /**
     * Clone data since simulation mutates original
     * @default false
     */
    cloneData?: boolean;

    /**
     * Callback function triggered when simulation starts
     */
    onStart?: () => void;

    /**
     * Callback function triggered on each simulation tick
     */
    onTick?: (e: { alpha: number; alphaTarget: number }) => void;

    /**
     * Callback function triggered when simulation ends
     */
    onEnd?: () => void;

    children?: Snippet<
      [
        {
          nodes: any[];
          simulation: Simulation<SimulationNodeDatum, undefined>;
          linkPositions: LinkPosition[];
        },
      ]
    >;
  };
</script>

<script lang="ts">
  import { getChartContext } from './Chart.svelte';
  import { watch } from 'runed';

  let {
    forces,
    links = [],
    alpha = $bindable(1),
    alphaTarget = 0,
    alphaDecay = 1 - Math.pow(0.001, 1 / 300),
    alphaMin = 0.001,
    velocityDecay = 0.4,
    stopped = false,
    static: staticProp,
    onStart: onStartProp = () => {},
    onTick: onTickProp = () => {},
    onEnd: onEndProp = () => {},
    children,
    cloneData = false,
  }: ForceSimulationProps = $props();

  const ctx = getChartContext();

  // MARK: Public Props

  // MARK: Private Props

  let nodes: SimulationNodeDatum[] = $state([]);
  let linkPositions: LinkPosition[] = $state([]);

  const simulation = forceSimulation().stop();

  // d3.Simulation does not provide a `.forces()` getter, so we need to
  // keep track of previous forces ourselves, for diffing against `forces`.
  let previousForces: Forces = {};

  let paused: boolean = true;

  // MARK: Reactivity Effects

  watch.pre(
    () => stopped,
    () => {
      // Any time the `stopped` prop gets toggled we
      // update the running state of the simulation:
      if (stopped) {
        pauseDynamicSimulation();
      } else {
        runOrResumeSimulation();
      }
    }
  );

  watch.pre(
    () => staticProp,
    () => {
      // Any time the `static` prop gets toggled we
      // either attach or detach our internal event listeners:
      if (staticProp) {
        simulation.on('tick', null).on('end', null);
      } else {
        simulation.on('tick', onTick).on('end', onEnd);
      }

      runOrResumeSimulation();
    }
  );

  watch.pre(
    () => ctx.data,
    () => {
      // Any time the `data` store gets changed we
      // pass them to the internal d3 simulation object:
      pushNodesToSimulation(ctx.data as any[]);
      runOrResumeSimulation();
    }
  );

  watch.pre(
    () => forces,
    () => {
      // Any time the `forces` prop gets changed we
      // pass them to the internal d3 simulation object:
      pushForcesToSimulation(forces);
      runOrResumeSimulation();
    }
  );

  watch.pre(
    () => alpha,
    () => {
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
  );

  watch.pre([() => alphaTarget, () => alphaMin, () => alphaDecay, () => velocityDecay], () => {
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
  });

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

  function updateLinkPositions() {
    // Keeping the link positions in sync with the simulation
    // so we don't need to recalculate _all_ link positions on each tick
    // which bogs down the simulation
    linkPositions = links.map((link: any) => ({
      x1: link.source.x ?? 0,
      y1: link.source.y ?? 0,
      x2: link.target.x ?? 0,
      y2: link.target.y ?? 0,
    }));
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
    if (staticProp) {
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

    if (!staticProp) {
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

    if (staticProp) {
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
    onStartProp();
  }

  function onTick() {
    pullNodesFromSimulation();
    pullAlphaFromSimulation();
    updateLinkPositions();

    onTickProp({ alpha, alphaTarget });
  }

  function onEnd() {
    if (paused) {
      // Avoid double-emissions of `end` event due to race conditions.
      return;
    }

    paused = true;
    onEndProp();
  }

  $effect(() => {
    return () => {
      simulation.stop();
      simulation.on('tick', null).on('end', null);
    };
  });
</script>

{@render children?.({ nodes, simulation, linkPositions })}
