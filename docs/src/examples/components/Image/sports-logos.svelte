<script lang="ts">
	import { Chart, Image, Axis, Layer } from 'layerchart';

	const data = [
		{
			team: 'Kansas City Chiefs',
			wins: 15,
			pointsScored: 496,
			abbrev: 'kc'
		},
		{
			team: 'San Francisco 49ers',
			wins: 12,
			pointsScored: 457,
			abbrev: 'sf'
		},
		{
			team: 'Dallas Cowboys',
			wins: 12,
			pointsScored: 509,
			abbrev: 'dal'
		},
		{
			team: 'Baltimore Ravens',
			wins: 13,
			pointsScored: 483,
			abbrev: 'bal'
		},
		{
			team: 'Detroit Lions',
			wins: 12,
			pointsScored: 461,
			abbrev: 'det'
		},
		{
			team: 'Buffalo Bills',
			wins: 11,
			pointsScored: 451,
			abbrev: 'buf'
		},
		{
			team: 'Miami Dolphins',
			wins: 11,
			pointsScored: 496,
			abbrev: 'mia'
		},
		{
			team: 'Green Bay Packers',
			wins: 9,
			pointsScored: 383,
			abbrev: 'gb'
		},
		{
			team: 'Philadelphia Eagles',
			wins: 11,
			pointsScored: 433,
			abbrev: 'phi'
		},
		{
			team: 'Cleveland Browns',
			wins: 11,
			pointsScored: 396,
			abbrev: 'cle'
		}
	];
</script>

<Chart
	{data}
	x="wins"
	y="pointsScored"
	xDomain={[8, 16]}
	yNice
	padding={{ top: 20, bottom: 30, left: 44, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" label="Wins" rule />
		<Axis placement="left" label="Points scored" rule />
		<Image
			href={(d) => `https://a.espncdn.com/i/teamlogos/nfl/500/${d.abbrev}.png`}
			x="wins"
			y="pointsScored"
			width={32}
			height={32}
		/>
	</Layer>
</Chart>
