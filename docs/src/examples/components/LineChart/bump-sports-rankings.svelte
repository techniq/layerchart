<script module lang="ts">
	export const title = 'Bump chart (sports rankings)';
	export const description = 'Weekly AP Top 25 poll for a college football or basketball season';
</script>

<script lang="ts">
	import {
		Axis,
		Chart,
		Circle,
		Group,
		Image,
		Layer,
		LinearGradient,
		Spline,
		Tooltip
	} from 'layerchart';
	import { Kbd, SelectField, getSettings } from 'svelte-ux';
	import { curveBumpX } from 'd3-shape';
	import { scalePoint } from 'd3-scale';
	import { index, range } from 'd3-array';
	import { cls } from '@layerstack/tailwind';
	import {
		getSportsRankings,
		getTeamGames,
		type SportsRank,
		type TeamGame
	} from '$lib/sports.remote';

	type Sport = Parameters<typeof getSportsRankings>[0]['sport'];

	const rowHeight = 28;
	const logoSize = 20;
	const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

	const sportOptions: { label: string; value: Sport }[] = [
		{ label: 'College Football', value: 'college-football' },
		{ label: "Men's College Basketball", value: 'mens-college-basketball' },
		{ label: "Women's College Basketball", value: 'womens-college-basketball' }
	];

	let sport = $state<Sport>('college-football');
	// `undefined` loads the latest season
	let season = $state<number>();

	// Hold Shift to hide the tooltip and see the highlighted lines underneath
	let hideTooltip = $state(false);

	const data = $derived(await getSportsRankings({ sport, season }));
	export { data };

	// Basketball seasons span two years (ex. 2026 = 2025-26)
	const seasonOptions = $derived(
		data.seasons.map((year) => ({
			label: sport.includes('basketball') ? `${year - 1}-${String(year).slice(2)}` : String(year),
			value: year
		}))
	);

	const teamsById = $derived(index(data.teams, (d) => d.id));
	const weekLabels = $derived(data.weeks.map((w) => w.label));

	/** Team abbreviations for the right axis, by position in the latest poll */
	const finalAbbreviations = $derived(
		new Map(
			data.ranks
				.filter((d) => d.week === weekLabels.at(-1))
				.map((d) => [d.position, teamsById.get(d.teamId)?.abbreviation])
		)
	);

	const rankByTeamWeek = $derived(
		index(
			data.ranks,
			(d) => d.teamId,
			(d) => d.week
		)
	);

	/** Color each segment by the move into the next week's poll */
	function lineColor(d: SportsRank) {
		const nextWeek = weekLabels[weekLabels.indexOf(d.week) + 1];
		const next = rankByTeamWeek.get(d.teamId)?.get(nextWeek);
		if (next == null || next.position === d.position) {
			return 'color-mix(in srgb, var(--color-surface-content) 30%, transparent)';
		}
		return next.position < d.position ? 'url(#gradient-improved)' : 'url(#gradient-declined)';
	}

	/** Split into runs of consecutive weeks so lines break where a team drops out */
	function teamSegments(teamId: string) {
		const segments: SportsRank[][] = [[]];
		for (const week of weekLabels) {
			const rank = rankByTeamWeek.get(teamId)?.get(week);
			if (rank) segments.at(-1)!.push(rank);
			else if (segments.at(-1)!.length) segments.push([]);
		}
		return segments.filter((segment) => segment.length);
	}

	/** Draw the highlighted team last so it is on top */
	function teamsInDrawOrder(highlightId: string | undefined) {
		return [...data.teams].sort(
			(a, b) => Number(a.id === highlightId) - Number(b.id === highlightId)
		);
	}

	/**
	 * When a week's games are played: from the poll's release until the next poll (or a week for
	 * the latest).  Older seasons don't have poll dates, so games can't be matched to a week.
	 */
	function pollWindow(week: string) {
		const i = weekLabels.indexOf(week);
		const start = data.weeks[i].date;
		if (!start) return undefined;
		const end = data.weeks[i + 1]?.date;
		return {
			start: new Date(start).getTime(),
			end: end ? new Date(end).getTime() : new Date(start).getTime() + WEEK_MS
		};
	}

	function gamesInWindow(games: TeamGame[], { start, end }: { start: number; end: number }) {
		return games.filter((g) => {
			const time = new Date(g.date).getTime();
			return time >= start && time < end;
		});
	}

	function opponentLabel(game: TeamGame) {
		const { abbreviation } = game.opponent;
		if (game.opponentRank) return `${abbreviation} (#${game.opponentRank})`;
		if (game.opponentSeed) return `${abbreviation} (${game.opponentSeed} seed)`;
		return abbreviation;
	}

	const { currentTheme } = getSettings();
	const logoKey = $derived($currentTheme.dark ? 'logoDark' : 'logo');
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Shift') hideTooltip = true;
	}}
	onkeyup={(e) => {
		if (e.key === 'Shift') hideTooltip = false;
	}}
	onblur={() => (hideTooltip = false)}
/>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">
	<SelectField
		label="Sport"
		options={sportOptions}
		bind:value={
			() => sport,
			(v) => {
				sport = v;
				season = undefined;
			}
		}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Season"
		options={seasonOptions}
		bind:value={
			() => data.season,
			(v) => {
				if (v !== data.season) season = v;
			}
		}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<div class="text-sm text-surface-content/50 mb-1">AP Top 25</div>

<Chart
	data={data.ranks}
	x="week"
	xScale={scalePoint().padding(0.5)}
	xDomain={weekLabels}
	y="position"
	yDomain={[data.maxRank + 0.5, 0.5]}
	padding={{ top: 24, bottom: 24, left: 36, right: 52 }}
	height={data.maxRank * rowHeight + 48}
	tooltipContext={{ mode: 'quadtree' }}
>
	{#snippet children({ context })}
		{@const highlightId = context.tooltip.data?.teamId}
		<Layer>
			<LinearGradient
				id="gradient-improved"
				stops={['var(--color-success-700)', 'var(--color-success-300)']}
			/>
			<LinearGradient
				id="gradient-declined"
				stops={['var(--color-danger-300)', 'var(--color-danger-700)']}
			/>

			<Axis placement="top" rule={false} />
			<Axis placement="bottom" rule={false} />
			<Axis placement="left" ticks={range(1, data.maxRank + 1)} format={(d) => `#${d}`} />
			<Axis
				placement="right"
				ticks={[...finalAbbreviations.keys()]}
				format={(d) => finalAbbreviations.get(d) ?? ''}
			/>

			{#each teamsInDrawOrder(highlightId) as team (team.id)}
				{@const segments = teamSegments(team.id)}
				{@const ranks = segments.flat()}
				<Group
					opacity={highlightId == null || highlightId === team.id ? 1 : 0.15}
					class="transition-opacity duration-200"
				>
					{#each segments as segment, i (i)}
						<Spline
							data={segment}
							curve={curveBumpX}
							stroke={lineColor}
							strokeWidth={highlightId === team.id ? 4 : 2}
							opacity={highlightId === team.id ? 1 : 0.5}
						/>
					{/each}
					<Circle
						data={ranks}
						cx="week"
						cy="position"
						r={logoSize / 2 + 2}
						class="fill-surface-100 stroke-surface-content/20"
					/>
					<Image
						data={ranks}
						href={team[logoKey]}
						x="week"
						y="position"
						width={logoSize}
						height={logoSize}
					/>
				</Group>
			{/each}
		</Layer>

		{#if !hideTooltip}
			<Tooltip.Root {context}>
				{#snippet children({ data: d })}
					{@const team = teamsById.get(d.teamId)}
					{@const gameWindow = pollWindow(d.week)}
					{@const games = gameWindow
						? getTeamGames({ sport, season: data.season, teamId: d.teamId })
						: undefined}
					<Tooltip.Header>
						<div class="flex items-center gap-2">
							<img src={team?.[logoKey]} alt="" class="size-5" />
							{team?.name}
						</div>
					</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="Week" value={d.week === 'Pre' ? 'Preseason' : d.week} />
						<Tooltip.Item label="Rank" value="{d.tied ? 'T-' : '#'}{d.rank}" />
						{#if d.record}
							<Tooltip.Item label="Record" value={d.record} />
						{/if}

						{#if gameWindow && games && !games.error}
							<Tooltip.Separator />
							{#if games.current == null}
								<Tooltip.Item label="Games" value="Loading..." />
							{:else}
								{#each gamesInWindow(games.current, gameWindow) as game (game.id)}
									<div class="col-span-full flex items-center gap-1">
										{#if game.result}
											<span
												class={cls(
													game.result === 'W' && 'text-success',
													game.result === 'L' && 'text-danger'
												)}
											>
												{game.result}
											</span>
											{game.score}-{game.opponentScore}
										{:else}
											{game.status}
										{/if}
										{game.home || game.neutralSite ? 'vs' : '@'}
										<img src={game.opponent[logoKey]} alt="" class="size-4" />
										{opponentLabel(game)}
									</div>
								{:else}
									<Tooltip.Item label="Games" value="None" />
								{/each}
							{/if}
						{/if}
					</Tooltip.List>
					<div class="-mx-2 -mb-1 mt-1 px-2 py-1 border-t text-xs text-surface-content/60">
						Hold <Kbd class="py-0 px-1 mx-1 border">Shift</Kbd> to hide tooltip
					</div>
				{/snippet}
			</Tooltip.Root>
		{/if}
	{/snippet}
</Chart>
