<script lang="ts">
	import Code from './Code.svelte';
	import { Tabs } from 'svelte-ux';

	interface Props {
		language?: string;
		includeCopyButton?: boolean;
		options: {
			value: number;
			label: string;
			source: string;
		}[];
	}

	let { language = '', includeCopyButton = true, options }: Props = $props();

	let value = $state(0);
</script>

<div class="w-full py-4">
	<Tabs
		{options}
		placement="top"
		bind:value
		classes={{
			content: 'border rounded-b rounded-tr',
			tab: { root: 'rounded-t' }
		}}
	>
		<svelte:fragment slot="content" let:value>
			<Code source={`${options[value].source}`} {language} {includeCopyButton} />
		</svelte:fragment>
	</Tabs>
</div>

<style>
	/* Note: Can be updated if Svelte-UX with activetab css class. */
	:global(.Tabs button.bg-surface-100) {
		background-color: var(--color-surface-300);
		border-bottom-color: var(--color-surface-300);
	}
</style>
