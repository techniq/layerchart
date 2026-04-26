<script lang="ts">
	import { useIntersectionObserver } from 'runed';
	import { Field, Switch, type LabelPlacement } from 'svelte-ux';

	let {
		show = $bindable(),
		label = 'Show',
		labelPlacement = 'left' as LabelPlacement,
		inline = false,
		class: className = 'absolute top-2 right-2 z-1'
	} = $props();

	let target = $state<HTMLElement | null>(null);

	useIntersectionObserver(
		() => target,
		(entries) => {
			const entry = entries[0];
			if (entry?.isIntersecting) {
				setTimeout(() => {
					show = true;
				}, 750);
			}
		},
		{ once: true }
	);
</script>

{#if !inline}
	<div
		bind:this={target}
		class="grid grid-cols-[auto_1fr] gap-2 mb-3 screenshot-hidden screenshot-delay"
	>
		<Field {label} {labelPlacement} let:id class={className}>
			<Switch bind:checked={show} size="md" />
		</Field>
	</div>
{:else}
	<div bind:this={target} class="screenshot-delay">
		<Field {label} let:id>
			<Switch bind:checked={show} size="md" />
		</Field>
	</div>
{/if}
