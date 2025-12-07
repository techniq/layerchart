<script lang="ts">
	import { format } from '@layerstack/utils';

	import Code from '$lib/components/Code.svelte';

	const fmtSource =
		` <script lang="ts">
  import { format } from '@layerstack/utils';

  format(1234.56, "integer");
  format(1234.56, "decimal");
  format(1234.56, "currency");
  format(0.5678, "percent");
  format(0.5678, "percentRound");
  format(1_234_567, "metric");
  format(new Date(), "day", { variant: "short" });
  format(new Date(), "custom", { custom: "eee, MMMM do" });
</` +
		`script>
`;
</script>

{format(1234.56, 'integer')}<br />
{format(1234.56, 'decimal')}<br />
{format(1234.56, 'currency')}<br />
{format(0.5678, 'percent')}<br />
{format(0.5678, 'percentRound')}<br />
{format(1_234_567, 'metric')}<br />
{format(new Date(), 'day', { variant: 'short' })}<br />
{format(new Date(), 'custom', { custom: 'eee, MMMM do' })}<br />
<Code source={fmtSource} language="js" copyButton={false} lang="ts" />
