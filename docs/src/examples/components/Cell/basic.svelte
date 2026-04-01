<script lang="ts">
	import { Chart, Cell, Axis, Layer } from 'layerchart';
	import { scaleBand } from 'd3-scale';

	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const hours = ['9am', '10am', '11am', '12pm', '1pm'];

	// Use seeded random for consistent results
	let seed = 42;
	function seededRandom() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}

	const data = days.flatMap((day) =>
		hours.map((hour) => ({
			day,
			hour,
			value: Math.floor(seededRandom() * 100),
		}))
	);
</script>

<Chart
	{data}
	x="day"
	xScale={scaleBand()}
	y="hour"
	yScale={scaleBand()}
	c="value"
	cDomain={[25, 50, 75]}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)',
	]}
	padding={{ top: 4, bottom: 20, left: 36, right: 4 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Cell x="day" y="hour" fill="value" insets={{ all: 1 }} />
	</Layer>
</Chart>
