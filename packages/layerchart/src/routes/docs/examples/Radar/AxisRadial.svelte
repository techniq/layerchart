<script lang="ts">
  import { getContext } from 'svelte';

  import Circle from '$lib/components/Circle.svelte';
  import Group from '$lib/components/Group.svelte';
  import Text from '$lib/components/Text.svelte';
  import { round } from 'svelte-ux';

  const { xScale, extents, config } = getContext('LayerCake');

  /** @type {Number} [lineLengthFactor=1.1] - How far to extend the lines from the circle's center. A value of `1` puts them at the circle's circumference. */
  export let lineLengthFactor = 1.1;

  /** @type {Number} [labelPlacementFactor=1.25] - How far to place the labels from the circle's center. A value of `1` puts them at the circle's circumference. */
  export let labelPlacementFactor = 1.25;

  $: max = $xScale(Math.max(...$extents.x));

  $: angleSlice = (Math.PI * 2) / $config.x.length;
</script>

<Group center>
  <Circle r={max} class="stroke-surface-content/20 fill-surface-200/50" />
  <Circle r={max / 2} class="stroke-surface-content/20 fill-none" />

  {#each $config.x as label, i}
    {@const thisAngleSlice = angleSlice * i - Math.PI / 2}

    <line
      x2={max * lineLengthFactor * Math.cos(thisAngleSlice)}
      y2={max * lineLengthFactor * Math.sin(thisAngleSlice)}
      class="stroke-surface-content/20 fill-none"
    >
    </line>

    {@const angleCos = round(Math.cos(thisAngleSlice), 2)}

    <Text
      value={label}
      x={max * labelPlacementFactor * Math.cos(thisAngleSlice)}
      y={max * labelPlacementFactor * Math.sin(thisAngleSlice)}
      textAnchor={angleCos > 0 ? 'start' : angleCos < 0 ? 'end' : 'middle'}
      class="text-xs"
      dy={4}
    />
  {/each}
</Group>
