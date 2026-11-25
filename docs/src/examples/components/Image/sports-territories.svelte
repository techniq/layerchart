<script lang="ts">
	import { group } from 'd3-array';
	import { geoAlbersUsa, geoConicEqualArea, geoPath } from 'd3-geo';
	import { untrack } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { feature } from 'topojson-client';
	import LucideFocus from '~icons/lucide/focus';

	import {
		Chart,
		Circle,
		ClipPath,
		Image,
		Layer,
		Path,
		Tooltip,
		Voronoi,
		shapeLabel,
		type ChartState
	} from 'layerchart';
	import { GeoPath } from 'layerchart/geo';
	import { Button, Field, SelectField, ToggleGroup, ToggleOption, getSettings } from 'svelte-ux';
	import {
		getAdmin1Topology,
		getSportsTeams,
		type SportsLeague,
		type SportsTeam
	} from '$lib/geo.remote';
	import { sportsLogo } from '$lib/utils/sports';

	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	const [usTopology, canadaTopology, allTeams] = $derived(
		await Promise.all([getAdmin1Topology('USA'), getAdmin1Topology('CAN'), getSportsTeams()])
	);
	const usStates = $derived(feature(usTopology, usTopology.objects.admin1).features);
	const provinces = $derived(feature(canadaTopology, canadaTopology.objects.admin1).features);

	let area = $state<'us' | 'us-canada'>('us');
	const regions = $derived(area === 'us' ? usStates : [...usStates, ...provinces]);

	/** A region's state or province code (ex. `US-TX` → `TX`), to match teams' */
	const regionCode = (region: (typeof regions)[number]) => region.properties.code?.split('-')[1];

	const geo = $derived(
		area === 'us'
			? // Alaska and Hawaii inset
				{
					projection: geoAlbersUsa,
					fitGeojson: { type: 'FeatureCollection' as const, features: usStates }
				}
			: {
					projection: () => geoConicEqualArea().parallels([30, 60]).rotate([96, 0]),
					// The lower 48 and Canada's provinces up to 60°N (where their territories' logos are)
					fitGeojson: {
						type: 'GeometryCollection' as const,
						geometries: [
							feature(usTopology, usTopology.objects.fit).geometry,
							{
								type: 'MultiPoint' as const,
								coordinates: [
									[-130, 60],
									[-100, 60],
									[-64, 50]
								]
							}
						]
					}
				}
	);

	const leagueOptions: { label: string; value: SportsLeague; group: string }[] = [
		{ label: 'College basketball', value: 'cbb', group: "Men's" },
		{ label: 'College football (D-I)', value: 'cfb', group: "Men's" },
		{ label: 'College football (D-II)', value: 'cfb2', group: "Men's" },
		{ label: 'College football (D-III)', value: 'cfb3', group: "Men's" },
		{ label: 'MLB', value: 'mlb', group: "Men's" },
		{ label: 'NBA', value: 'nba', group: "Men's" },
		{ label: 'NFL', value: 'nfl', group: "Men's" },
		{ label: 'NHL', value: 'nhl', group: "Men's" },
		{ label: 'College basketball', value: 'wcbb', group: "Women's" },
		{ label: 'WNBA', value: 'wnba', group: "Women's" }
	];
	let league = $state<SportsLeague>('cfb');
	const leagueTeams = $derived(allTeams.filter((t) => t.league === league));

	/**
	 * Conferences, grouped by the level above them when there is one: a pro league's conferences
	 * hold its divisions, and college football's subdivisions (FBS and FCS) hold its conferences
	 */
	const groupOptions = $derived.by(() => {
		const [parent, child] = leagueTeams.some((t) => t.division)
			? (['conference', 'division'] as const)
			: leagueTeams.some((t) => t.subdivision)
				? (['subdivision', 'conference'] as const)
				: ([null, 'conference'] as const);
		const values = (teams: SportsTeam[], key: 'subdivision' | 'conference' | 'division') =>
			[...new Set(teams.map((t) => t[key]!))].sort();

		return [
			{ label: 'All conferences', value: null },
			...(parent
				? values(leagueTeams, parent).flatMap((p) => [
						{ label: `All ${p}`, value: p, group: p },
						...values(
							leagueTeams.filter((t) => t[parent] === p),
							child
						).map((c) => ({ label: c, value: c, group: p }))
					])
				: values(leagueTeams, child).map((c) => ({ label: c, value: c })))
		];
	});
	let selectedGroup = $state<string | null>(null);

	const teams = $derived(
		selectedGroup
			? leagueTeams.filter((t) => [t.subdivision, t.conference, t.division].includes(selectedGroup))
			: leagueTeams
	);

	/**
	 * Each state (or province) with its teams, by code rather than location (which can be just
	 * outside a simplified border, ex. a stadium on a river)
	 */
	const teamsByState = $derived(group(teams, (t) => t.state));
	const regionTeams = $derived(
		regions.flatMap((region) => {
			const teams = teamsByState.get(regionCode(region)!);
			return teams ? [{ region, teams }] : [];
		})
	);

	/** Teams outside of every region (ex. Toronto on the US map), shown without a territory */
	const outsideTeams = $derived.by(() => {
		const codes = new Set(regions.map(regionCode));
		return teams.filter((t) => !codes.has(t.state));
	});

	let chart = $state<ChartState>();

	/**
	 * Where the conference is on screen: its states, and any teams outside them (ex. Toronto's on the
	 * US map).  Follows the conference, sport and map, and the chart's size (which the projection fits).
	 */
	const focusBounds = $derived.by(() => {
		const projection = chart?.geo.projection;
		if (!projection) return null;
		const [[x0, y0], [x1, y1]] = geoPath(projection).bounds({
			type: 'GeometryCollection',
			geometries: [
				...regionTeams.map(({ region }) => region.geometry),
				{ type: 'MultiPoint', coordinates: outsideTeams.map((t) => [t.longitude, t.latitude]) }
			]
		});
		return Number.isFinite(x0) ? { x0, y0, x1, y1 } : null;
	});

	/** Whether to keep zoomed to the conference */
	let focused = $state(false);

	$effect(() => {
		if (!focused || !chart || !focusBounds) return;
		const { x0, y0, x1, y1 } = focusBounds;
		const { transform } = chart;
		const padding = 40;
		// Only follow the bounds (not the transform it changes)
		untrack(() =>
			transform.zoomTo(
				{ x: (x0 + x1) / 2, y: (y0 + y1) / 2 },
				{ width: x1 - x0 + padding, height: y1 - y0 + padding }
			)
		);
	});

	/** ESPN's team ids are only unique within a league */
	const key = (team: SportsTeam) => `${team.league}-${team.id}`;

	const { currentTheme } = getSettings();

	const data = $derived({ usTopology, canadaTopology, allTeams });

	export { data };
</script>

<div class="grid grid-cols-[auto_1fr_auto] gap-3 mb-2">
	<SelectField
		label="Sport"
		options={leagueOptions}
		bind:value={
			() => league,
			(v) => {
				league = v;
				selectedGroup = null;
			}
		}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Conference"
		options={groupOptions}
		bind:value={selectedGroup}
		clearable={false}
		toggleIcon={null}
		stepper
	>
		<div slot="append" onclick={(e) => e.stopPropagation()} role="none">
			<Button
				icon={LucideFocus}
				on:click={() => {
					focused = !focused;
					if (!focused) chart?.transform.reset();
				}}
				size="sm"
				variant={focused ? 'fill-light' : 'default'}
				color={focused ? 'primary' : 'default'}
				title={focused ? 'Stop following the conference' : 'Zoom to the conference'}
				aria-pressed={focused}
			/>
		</div>
	</SelectField>
	<Field label="Map" dense>
		<ToggleGroup bind:value={area} variant="outline" size="sm">
			<ToggleOption value="us">US</ToggleOption>
			<ToggleOption value="us-canada">US + Canada</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	bind:context={chart}
	{geo}
	transform={{
		mode: 'canvas',
		scrollMode: 'scale',
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
	height={600}
	clip
	padding={{ right: 32 }}
>
	{#snippet children({ context })}
		{@const projection = context.geo.projection}
		{@const strokeWidth = 1 / context.transform.scale}
		{@const hovered = context.tooltip.data as SportsTeam | null}

		<TransformContextControls />

		<Layer>
			{#each regions as region (region.id)}
				<GeoPath geojson={region} class="fill-surface-content/5 stroke-none" />
			{/each}

			<!-- Each state divided between its teams: the Voronoi cells of their locations, cut to it -->
			{#each regionTeams as { region, teams } (region.id)}
				<Voronoi
					data={teams}
					x="longitude"
					y="latitude"
					clip={region}
					onpointermove={(e, { data }) => context.tooltip.show(e, data)}
					onpointerleave={() => context.tooltip.hide()}
				>
					{#snippet children({ cells })}
						{#each cells as cell (key(cell.data))}
							{#if cell.path}
								<ClipPath path={cell.path}>
									<Path pathData={cell.path} fill={cell.data.color} class="pointer-events-none" />
									{#if cell.data.logo_key}
										<!-- In the largest square that fits, so the logo isn't cut off -->
										{@const { x, y, width, height } = shapeLabel(cell.polygons, {
											fit: 'rect',
											centroidWeight: 0.01
										})}
										<Image
											href={sportsLogo(cell.data, { variant: 'on-color', size: 192 })}
											{x}
											{y}
											{width}
											{height}
											class="pointer-events-none"
										/>
									{/if}
								</ClipPath>
								<Path
									pathData={cell.path}
									{strokeWidth}
									class="fill-none stroke-surface-100/50 pointer-events-none"
								/>
							{/if}
						{/each}
					{/snippet}
				</Voronoi>
			{/each}

			{#each regions as region (region.id)}
				<GeoPath
					geojson={region}
					strokeWidth={1.5 * strokeWidth}
					class="fill-none stroke-surface-100 pointer-events-none"
				/>
			{/each}

			<!-- The hovered territory's outline, above the state borders -->
			{@const hoveredRegion = regionTeams.find(({ teams }) => hovered && teams.includes(hovered))}
			{#if hoveredRegion}
				<Voronoi
					data={hoveredRegion.teams}
					x="longitude"
					y="latitude"
					clip={hoveredRegion.region}
					class="pointer-events-none"
				>
					{#snippet children({ cells })}
						{@const cell = cells.find((c) => c.data === hovered)}
						{#if cell?.path}
							<Path
								pathData={cell.path}
								strokeWidth={2 * strokeWidth}
								class="fill-none stroke-surface-content"
							/>
						{/if}
					{/snippet}
				</Voronoi>
			{/if}

			<!-- Campus (college) or venue (pro) locations -->
			{#each teams as team (key(team))}
				{@const point = projection?.([team.longitude, team.latitude])}
				{#if point}
					<Circle
						cx={point[0]}
						cy={point[1]}
						r={(team === hovered ? 4 : 2.5) * strokeWidth}
						{strokeWidth}
						fill={team.alt_color}
						class="stroke-surface-content pointer-events-none"
					/>
				{/if}
			{/each}

			<!-- Teams outside of every region, as a badge at their location (if on the map) -->
			{#each outsideTeams as team (key(team))}
				{@const point = projection?.([team.longitude, team.latitude])}
				{#if point}
					<Circle
						cx={point[0]}
						cy={point[1]}
						r={14 * strokeWidth}
						{strokeWidth}
						fill={team.color}
						class="stroke-surface-100"
						onpointermove={(e) => context.tooltip.show(e, team)}
						onpointerleave={() => context.tooltip.hide()}
					/>
					{#if team.logo_key}
						<Image
							href={sportsLogo(team, { variant: 'on-color', size: 64 })}
							x={point[0]}
							y={point[1]}
							width={22 * strokeWidth}
							height={22 * strokeWidth}
							class="pointer-events-none"
						/>
					{/if}
				{/if}
			{/each}
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>
					<div class="flex items-center gap-2">
						{#if data.logo_key}
							<img
								src={sportsLogo(data, { variant: $currentTheme.dark ? 'dark' : 'default' })}
								alt=""
								class="size-6 object-contain"
							/>
						{/if}
						{data.name}
					</div>
				</Tooltip.Header>
				<Tooltip.List>
					{#if data.campus}
						<Tooltip.Item label="Campus" value={data.campus} />
					{/if}
					{#if data.venue}
						<Tooltip.Item label="Venue" value={data.venue} />
					{/if}
					{#if data.city}
						<Tooltip.Item label="Location" value="{data.city}, {data.state}" />
					{/if}
					<Tooltip.Item
						label="Conference"
						value={data.subdivision ? `${data.conference} (${data.subdivision})` : data.conference}
					/>
					{#if data.division}
						<Tooltip.Item label="Division" value={data.division} />
					{/if}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
