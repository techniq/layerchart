<script lang="ts">
	import { format } from '@layerstack/utils';
</script>

{format(1234.56, 'integer')}<br />
{format(1234.56, 'decimal')}<br />
{format(1234.56, 'currency')}<br />
{format(1234.56, 'currency', { currency: 'EUR' })}<br />
{format(0.5678, 'percent')}<br />
{format(0.5678, 'percentRound')}<br />
{format(1_234_567, 'metric')}<br />
{format(new Date(), 'day', { variant: 'short' })}<br />
{format(new Date(), 'custom', { custom: 'eee, MMMM do' })}<br />
