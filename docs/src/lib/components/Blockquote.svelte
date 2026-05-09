<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import InfoIcon from '~icons/lucide/info';
	import LightbulbIcon from '~icons/lucide/lightbulb';
	import WarningIcon from '~icons/lucide/triangle-alert';
	import CautionIcon from '~icons/lucide/octagon-alert';

	const { children, type = 'basic' } = $props();

	const typeClasses = new Map([
		[
			'basic',
			{
				container: 'bg-primary/10 border-primary/30 border-l-primary text-primary',
				icon: 'text-primary'
			}
		],
		[
			'note',
			{
				container: 'bg-blue-500/10 border-blue-500/30 border-l-blue-500 text-blue-500',
				icon: 'text-blue-500'
			}
		],
		[
			'tip',
			{
				container: 'bg-success/10 border-success/30 border-l-success text-success',
				icon: 'text-success'
			}
		],
		[
			'warning',
			{
				container: 'bg-warning/10 border-warning/30 border-l-warning text-warning',
				icon: 'text-warning'
			}
		],
		[
			'caution',
			{
				container: 'bg-danger/10 border-danger/30 border-l-danger text-danger',
				icon: 'text-danger'
			}
		]
	]);

	const classes = $derived(typeClasses.get(type) ?? typeClasses.get('basic')!);
</script>

<div
	class={cls(
		'border border-l-[6px] px-4 py-2 my-4 rounded-sm flex items-center gap-2 text-sm',
		'[&>a]:font-medium [&>a]:underline [&>a]:decoration-dashed [&>a]:underline-offset-2',
		classes.container
	)}
>
	{#if type === 'note'}<InfoIcon class={classes.icon} />
	{:else if type === 'tip'}<LightbulbIcon class={classes.icon} />
	{:else if type === 'warning'}<WarningIcon class={classes.icon} />
	{:else if type === 'caution'}<CautionIcon class={classes.icon} />
	{:else}<InfoIcon class={classes.icon} />
	{/if}
	{@render children()}
</div>
