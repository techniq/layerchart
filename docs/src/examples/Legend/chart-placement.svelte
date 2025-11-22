<script>
	import { Chart, Legend } from 'layerchart';
	import { scaleOrdinal } from 'd3-scale';
</script>

<Chart
	data={[{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]}
	c="name"
	cScale={scaleOrdinal()}
	cRange={['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)']}
	height={200}
>
	<Legend title="Top-Left" placement="top-left" variant="swatches" />
	<Legend title="Top" placement="top" variant="swatches" />
	<Legend title="Top-Right" placement="top-right" variant="swatches" />
	<Legend title="Left" placement="left" variant="swatches" />
	<Legend title="Center" placement="center" variant="swatches" />
	<Legend title="Right" placement="right" variant="swatches" />
	<Legend title="Bottom-Left" placement="bottom-left" variant="swatches" />
	<Legend title="Bottom" placement="bottom" variant="swatches" />
	<Legend title="Bottom-Right" placement="bottom-right" variant="swatches" />
</Chart>
