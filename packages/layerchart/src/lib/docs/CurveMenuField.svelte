<script lang="ts">
  import * as d3shapes from 'd3-shape';

  import { MenuField } from 'svelte-ux';
  import { entries } from '@layerstack/utils';

  export let value: any | undefined = d3shapes['curveLinear'];
  export let showOpenClosed = false;

  const options = entries(d3shapes)
    .filter(([key]) => {
      return (
        key.startsWith('curve') &&
        (showOpenClosed ? true : !key.endsWith('Open') && !key.endsWith('Closed')) &&
        !key.includes('Bundle') // Not compatibile with area
      );
    })
    .map(([key, value]) => {
      return {
        label: key.replace('curve', ''),
        value: value,
      };
    });
</script>

<MenuField label="Curve" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
