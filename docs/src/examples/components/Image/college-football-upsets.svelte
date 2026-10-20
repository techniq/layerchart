<script module lang="ts">
	export const title = 'College football upsets';
	export const description =
		"Every game involving a ranked team, placed at the team's rank for each week. Upsets (losing to a lower ranked or unranked team) stand out.";
</script>

<script lang="ts">
	import { Axis, Chart, Group, Image, Layer, Rect, Tooltip } from 'layerchart';
	import { Kbd, SelectField, getSettings } from 'svelte-ux';
	import { scalePoint } from 'd3-scale';
	import { range } from 'd3-array';
	import { cls } from '@layerstack/tailwind';
	import { getRankedMatchups, type Matchup, type MatchupTeam } from '$lib/sports.remote';

	const maxRank = 25;
	const rowHeight = 26;
	const logoSize = 16;
	const cellWidth = logoSize * 2 + 10;
	const cellHeight = logoSize + 6;

	// `undefined` loads the latest season
	let season = $state<number>();

	// Hold Shift to hide the tooltip and see the highlighted game underneath
	let hideTooltip = $state(false);

	const data = $derived(await getRankedMatchups({ season }));
	export { data };

	const seasonOptions = $derived(
		data.seasons.map((year) => ({ label: String(year), value: year }))
	);

	/** Winner was ranked lower than the loser (or unranked) */
	function isUpset(game: Matchup) {
		const winner = game.teams.find((t) => t.result === 'W');
		const loser = game.teams.find((t) => t.result === 'L');
		return !!loser?.rank && (winner?.rank ?? Infinity) > loser.rank;
	}

	type Cell = {
		game: Matchup;
		week: string;
		rank: number;
		team: MatchupTeam;
		opponent: MatchupTeam;
		upset: boolean;
	};

	/** One cell for each ranked team in a game */
	const cells = $derived.by(() => {
		const cells: Cell[] = [];
		for (const game of data.games) {
			const [a, b] = game.teams;
			for (const [team, opponent] of [
				[a, b],
				[b, a]
			]) {
				if (team.rank) {
					cells.push({
						game,
						week: game.week,
						rank: team.rank,
						team,
						opponent,
						upset: isUpset(game)
					});
				}
			}
		}
		return cells;
	});

	const upsetCount = $derived(data.games.filter(isUpset).length);

	const { currentTheme } = getSettings();
	const logoKey = $derived($currentTheme.dark ? 'logoDark' : 'logo');

	/** Upsets stand out, while expected results recede (`cell` for the chart, `swatch` for the legend) */
	const styles = {
		win: {
			label: 'Win',
			cell: 'fill-surface-content/5 stroke-surface-content/20',
			swatch: 'border bg-surface-content/5 border-surface-content/20'
		},
		loss: {
			label: 'Loss',
			cell: 'fill-danger/10 stroke-danger/40',
			swatch: 'border bg-danger/10 border-danger/40'
		},
		upsetLoss: {
			label: 'Upset loss',
			cell: 'fill-danger/40 stroke-danger',
			swatch: 'border-2 bg-danger/40 border-danger'
		},
		upsetWin: {
			label: 'Upset win',
			cell: 'fill-success/40 stroke-success',
			swatch: 'border-2 bg-success/40 border-success'
		}
	};

	function cellStyle(cell: Cell) {
		if (cell.upset) return cell.team.result === 'W' ? styles.upsetWin : styles.upsetLoss;
		return cell.team.result === 'L' ? styles.loss : styles.win;
	}
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

<div class="grid grid-cols-[auto_1fr] items-end gap-4 mb-2">
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
	<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-content/70 pb-2">
		{#each Object.values(styles) as style (style.label)}
			<span class="flex items-center gap-1">
				<span class={cls('inline-block w-4 h-3 rounded-full', style.swatch)}></span>
				{style.label}
			</span>
		{/each}
		<span>{upsetCount} upsets</span>
	</div>
</div>

<Chart
	data={cells}
	x="week"
	xScale={scalePoint().padding(0.5)}
	xDomain={data.weeks}
	y="rank"
	yDomain={[maxRank + 0.5, 0.5]}
	padding={{ top: 24, bottom: 24, left: 32, right: 0 }}
	height={maxRank * rowHeight + 48}
	tooltipContext={{ mode: 'quadtree' }}
>
	{#snippet children({ context })}
		{@const highlightId = context.tooltip.data?.game.id}
		<Layer>
			<Axis placement="top" rule={false} />
			<Axis placement="bottom" rule={false} />
			<Axis placement="left" ticks={range(1, maxRank + 1)} format={(d) => `#${d}`} />

			{#each cells as cell (cell.game.id + cell.team.id)}
				{@const x = context.xScale(cell.week) ?? 0}
				{@const y = context.yScale(cell.rank)}
				{@const style = cellStyle(cell)}
				<Group
					opacity={highlightId == null || highlightId === cell.game.id ? 1 : 0.2}
					class="transition-opacity duration-200"
				>
					<Rect
						x={x - cellWidth / 2}
						y={y - cellHeight / 2}
						width={cellWidth}
						height={cellHeight}
						rx={cellHeight / 2}
						strokeWidth={cell.upset ? 2 : 1}
						class={style.cell}
					/>
					<Image
						href={cell.team[logoKey]}
						x={x - logoSize / 2 - 2}
						{y}
						width={logoSize}
						height={logoSize}
					/>
					<Image
						href={cell.opponent[logoKey]}
						x={x + logoSize / 2 + 2}
						{y}
						width={logoSize}
						height={logoSize}
					/>
				</Group>
			{/each}
		</Layer>

		{#if !hideTooltip}
			<Tooltip.Root {context}>
				{#snippet children({ data: cell })}
					{@const result = cell.team.result}
					<Tooltip.Header>
						<div class="flex items-center gap-2">
							<img src={cell.team[logoKey]} alt="" class="size-5" />
							{cell.team.name} (#{cell.rank})
						</div>
					</Tooltip.Header>
					<Tooltip.List>
						<div class="col-span-full flex items-center gap-1">
							{#if result}
								<span
									class={cls(result === 'W' && 'text-success', result === 'L' && 'text-danger')}
								>
									{result}
								</span>
								{cell.team.score}-{cell.opponent.score}
							{:else}
								{cell.game.status}
							{/if}
							vs
							<img src={cell.opponent[logoKey]} alt="" class="size-4" />
							{cell.opponent.abbreviation}
							{cell.opponent.rank ? `(#${cell.opponent.rank})` : ''}
						</div>
						{#if cell.upset}
							<div
								class={cls(
									'col-span-full text-xs font-semibold uppercase',
									result === 'W' ? 'text-success' : 'text-danger'
								)}
							>
								Upset
							</div>
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
