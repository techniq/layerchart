<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3shapes from 'd3-shape';

  import { MenuField } from 'svelte-ux';

  export let value: any | undefined = undefined;

  const options = Object.keys(d3shapes)
    .filter((key) => key.startsWith('curve'))
    .filter((key) => !key.endsWith('Open') && !key.endsWith('Closed'))
    .map((key) => {
      return {
        label: key.replace('curve', ''),
        value: d3shapes[key]
      };
    });

  onMount(() => {
    value = d3shapes['curveLinear'];
  });
</script>

<MenuField label="Curve" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
