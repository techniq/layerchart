<script lang="ts">
  import { createDateSeries } from '$lib/utils/data';
  import { BarChart } from 'layerchart';

  const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
  export { data };
</script>

<BarChart {data} x="date" y="value" height={300} />