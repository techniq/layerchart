<script>
	import { Chart, Legend } from 'layerchart';
	import { scaleOrdinal } from 'd3-scale';
</script>

<Chart
	data={[{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]}
	c="name"
	cScale={scaleOrdinal()}
	cRange={['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)']}
	height={300}
>
	<Legend title="top-left" placement="top-left" variant="swatches" />
	<Legend title="top" placement="top" variant="swatches" />
	<Legend title="top-right" placement="top-right" variant="swatches" />
	<Legend title="left" placement="left" variant="swatches" />
	<Legend title="center" placement="center" variant="swatches" />
	<Legend title="right" placement="right" variant="swatches" />
	<Legend title="bottom-left" placement="bottom-left" variant="swatches" />
	<Legend title="bottom" placement="bottom" variant="swatches" />
	<Legend title="bottom-right" placement="bottom-right" variant="swatches" />
</Chart>
