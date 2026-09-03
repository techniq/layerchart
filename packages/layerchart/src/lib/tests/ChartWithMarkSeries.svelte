<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Bars from '$lib/components/Bars/Bars.svelte';
  import Spline from '$lib/components/Spline/Spline.svelte';
  import Legend from '$lib/components/Legend.svelte';

  // Long rows coloured by `c`, plus a line with its own data — which registers as a series
  // named `target`, competing with the `c` categories for the legend
  const data = [
    { month: 'Jan', fruit: 'apples', value: 30 },
    { month: 'Jan', fruit: 'bananas', value: 20 },
    { month: 'Feb', fruit: 'apples', value: 40 },
    { month: 'Feb', fruit: 'bananas', value: 10 },
  ];
  const targets = [
    { month: 'Jan', target: 80 },
    { month: 'Feb', target: 90 },
  ];
</script>

<Chart {data} x="month" y="value" c="fruit" cRange={['red', 'yellow']} width={400} height={300}>
  <Layer>
    <Bars />
    <Spline data={targets} y="target" stroke="black" />
  </Layer>
  <Legend />
</Chart>
