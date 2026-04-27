<script lang="ts">
	import { Chart, Cell, Axis, Layer } from 'layerchart';
	import { scaleBand, scaleQuantize } from 'd3-scale';
	import { schemeGreens } from 'd3-scale-chromatic';
	import { extent } from 'd3-array';

	const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
	const rows = ['1', '2', '3', '4', '5'];

	// Use seeded random for consistent results
	let seed = 7;
	function seededRandom() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}

	const data = rows.flatMap((row) =>
		columns.map((col) => ({
			row,
			col,
			value: Math.floor(seededRandom() * 100)
		}))
	);
</script>

<Chart
	{data}
	x="col"
	xScale={scaleBand()}
	y="row"
	yScale={scaleBand()}
	c="value"
	cScale={scaleQuantize()}
	cDomain={extent(data, (d) => d.value)}
	cRange={schemeGreens[6]}
	padding={{ top: 4, bottom: 20, left: 16, right: 4 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Cell x="col" y="row" fill="value" insets={{ all: 2 }} rx={4} />
	</Layer>
</Chart>
