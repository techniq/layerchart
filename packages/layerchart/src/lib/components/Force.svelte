<script lang="ts">
  import { getContext } from 'svelte';
  import { forceSimulation, type Force } from 'd3-force';

  const { data } = getContext('LayerCake');

  export let forces: Record<string, Force<any, any>>;

  export let alpha = 1;

  const simulation = forceSimulation($data);

  $: {
    // When variables change, set forces and restart the simulation
    Object.entries(forces).forEach(([name, force]) => {
      simulation.force(name, force);
    });

    simulation.alpha(alpha).restart();
  }

  let nodes = [];
  simulation.on('tick', () => {
    nodes = simulation.nodes();
  });
</script>

<slot {nodes} />
