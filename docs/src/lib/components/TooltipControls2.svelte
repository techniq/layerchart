<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Button, Field, Menu, MenuField, Toggle } from 'svelte-ux';
	import { Tooltip } from 'layerchart';

	// <TooltipControls2 bind:anchor bind:snap bind:contained />

	interface Props {
		anchor?: ComponentProps<typeof Tooltip.Root>['anchor'];
		snap?: 'pointer' | 'data';
		contained?: ComponentProps<typeof Tooltip.Root>['contained'];
	}

	const anchorOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	] as const;

	let {
		anchor = $bindable('top-left' as ComponentProps<typeof Tooltip.Root>['anchor']),
		snap = $bindable('pointer' as 'pointer' | 'data'),
		contained = $bindable(false as ComponentProps<typeof Tooltip.Root>['contained'])
	}: Props = $props();
</script>

<div class="grid grid-cols-3 gap-2 mb-4 screenshot-hidden">
	<Toggle let:on={open} let:toggle>
		<Field label="Anchor" class="cursor-pointer" on:click={toggle}>
			<span class="text-sm">
				{anchor}
			</span>
		</Field>

		<Menu {open} on:close={toggle} placement="bottom-start">
			<div class="grid grid-cols-3 gap-1 p-1">
				{#each anchorOptions as option}
					<Button
						variant="outline"
						color={option === anchor ? 'primary' : 'default'}
						on:click={() => (anchor = option)}
					>
						{option}
					</Button>
				{/each}
			</div>
		</Menu>
	</Toggle>
	<MenuField
		label="Snap"
		bind:value={snap}
		options={[
			{ label: 'pointer', value: 'pointer' },
			{ label: 'data', value: 'data' }
		]}
	/>

	<MenuField
		label="Contained"
		bind:value={contained}
		options={[
			{ label: 'none', value: false },
			{ label: 'container', value: 'container' },
			{ label: 'window', value: 'window' }
		]}
	/>
</div>
