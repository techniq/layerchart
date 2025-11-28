<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Text } from 'layerchart';

	interface Props {
		config?: {
			x: number;
			y: number;
			value: string;
			width: number;
			textAnchor: ComponentProps<typeof Text>['textAnchor'];
			verticalAnchor: ComponentProps<typeof Text>['verticalAnchor'];
			lineHeight: string;
			rotate: number;
			scaleToFit: boolean;
			showAnchor: boolean;
			resizeSvg: boolean;
		};
		truncate?: boolean;
		truncateOptions?: {
			maxChars?: number;
			minChars?: number;
			ellipsis?: string;
			position?: 'start' | 'middle' | 'end';
		};
	}

	let {
		config = $bindable({
			x: 0,
			y: 0,
			value: 'This is really long text',
			width: 300,
			textAnchor: 'start',
			verticalAnchor: 'start',
			lineHeight: '1em',
			rotate: 0,
			scaleToFit: false,
			showAnchor: true,
			resizeSvg: true
		}),
		truncate = $bindable(false),
		truncateOptions = $bindable({
			maxChars: 22,
			minChars: 0,
			ellipsis: '…',
			position: 'end'
		})
	}: Props = $props();
</script>

<div class="grid gap-2 mb-2 screenshot-hidden">
	<TextField label="value" bind:value={config.value} />
	<div class="grid grid-cols-[1fr_1fr_1fr] gap-2">
		<RangeField label="x" bind:value={config.x} min={-300} max={300} />
		<RangeField label="y" bind:value={config.y} min={-300} max={300} />
		<RangeField label="width" bind:value={config.width} max={300} />

		<Field label="textAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
			<ToggleGroup bind:value={config.textAnchor} variant="outline" size="sm" inset class="w-full">
				<ToggleOption value="start">start</ToggleOption>
				<ToggleOption value="middle">middle</ToggleOption>
				<ToggleOption value="end">end</ToggleOption>
			</ToggleGroup>
		</Field>

		<Field label="verticalAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
			<ToggleGroup
				bind:value={config.verticalAnchor}
				variant="outline"
				size="sm"
				inset
				class="w-full"
			>
				<ToggleOption value="start">start</ToggleOption>
				<ToggleOption value="middle">middle</ToggleOption>
				<ToggleOption value="end">end</ToggleOption>
			</ToggleGroup>
		</Field>

		<Field label="showAnchor" let:id>
			<Switch bind:checked={config.showAnchor} {id} />
		</Field>

		<RangeField label="rotate" bind:value={config.rotate} max={720} />

		<TextField label="lineHeight" bind:value={config.lineHeight} />

		<Field label="scaleToFit" let:id>
			<Switch bind:checked={config.scaleToFit} {id} />
		</Field>

		<Field label="resize svg (container)" let:id>
			<Switch bind:checked={config.resizeSvg} {id} />
		</Field>
		<Field label="truncate text" let:id>
			<Switch bind:checked={truncate} {id} />
		</Field>
		{#if truncate}
			<RangeField
				label="maxChars"
				bind:value={truncateOptions.maxChars}
				min={0}
				max={config.value.length}
			/>

			<TextField label="ellipsis" bind:value={truncateOptions.ellipsis} />
			<Field label="position" classes={{ input: 'mt-[6px] mb-1' }}>
				<ToggleGroup
					bind:value={truncateOptions.position}
					variant="outline"
					size="sm"
					inset
					class="w-full"
				>
					<ToggleOption value="start">start</ToggleOption>
					<ToggleOption value="middle">middle</ToggleOption>
					<ToggleOption value="end">end</ToggleOption>
				</ToggleGroup>
			</Field>
		{/if}
	</div>
</div>
