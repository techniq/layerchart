<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Image, Layer, Tooltip } from 'layerchart';
	import { getUsStatesTopology } from '$lib/geo.remote';

	const topology = await getUsStatesTopology();
	const states = feature(topology, topology.objects.states);

	const teams = [
		{ college: 'Alabama', conf: 'SEC', latitude: 33.2098, longitude: -87.5692, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png' },
		{ college: 'Ohio State', conf: 'Big Ten', latitude: 40.0017, longitude: -83.0197, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png' },
		{ college: 'Georgia', conf: 'SEC', latitude: 33.9480, longitude: -83.3773, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png' },
		{ college: 'Michigan', conf: 'Big Ten', latitude: 42.2658, longitude: -83.7486, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png' },
		{ college: 'Texas', conf: 'SEC', latitude: 30.2849, longitude: -97.7341, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png' },
		{ college: 'USC', conf: 'Big Ten', latitude: 34.0224, longitude: -118.2851, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png' },
		{ college: 'Oregon', conf: 'Big Ten', latitude: 44.0582, longitude: -123.0687, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png' },
		{ college: 'Penn State', conf: 'Big Ten', latitude: 40.8124, longitude: -77.8564, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/213.png' },
		{ college: 'LSU', conf: 'SEC', latitude: 30.4121, longitude: -91.1838, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png' },
		{ college: 'Clemson', conf: 'ACC', latitude: 34.6834, longitude: -82.8374, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png' },
		{ college: 'Notre Dame', conf: 'Independent', latitude: 41.6984, longitude: -86.2340, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png' },
		{ college: 'Florida State', conf: 'ACC', latitude: 30.4383, longitude: -84.3043, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/52.png' },
		{ college: 'Oklahoma', conf: 'SEC', latitude: 35.2058, longitude: -97.4453, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png' },
		{ college: 'Tennessee', conf: 'SEC', latitude: 35.9544, longitude: -83.9253, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png' },
		{ college: 'Miami', conf: 'ACC', latitude: 25.7134, longitude: -80.2741, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png' },
		{ college: 'Washington', conf: 'Big Ten', latitude: 47.6507, longitude: -122.3015, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/264.png' },
		{ college: 'Colorado', conf: 'Big 12', latitude: 40.0094, longitude: -105.2669, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png' },
		{ college: 'Florida', conf: 'SEC', latitude: 29.6499, longitude: -82.3486, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/57.png' },
	];

	const data = { topology, teams };

	export { data };
</script>

<Chart
	data={teams}
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states,
	}}
	tooltipContext={{ mode: 'voronoi' }}
	x="longitude"
	y="latitude"
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			{#each states.features as feature (feature.id)}
				<GeoPath
					geojson={feature}
					class="fill-surface-content/5 stroke-surface-content/20"
				/>
			{/each}

			<Image
				href="logo"
				x="longitude"
				y="latitude"
				width={28}
				height={28}
				r={14}
				preserveAspectRatio="xMidYMid slice"
			/>
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.college}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Conference" value={data.conf} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
