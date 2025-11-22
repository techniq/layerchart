<script lang="ts">
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	// <GroupedStackedCombo bind:chartMode />

	interface Props {
		chartMode: 'group' | 'stack' | 'groupStack';
	}

	let { chartMode = $bindable('group') }: Props = $props();
</script>

<div class="screenshot-hidden">
	<Field label="Mode" class="mb-4">
		<ToggleGroup bind:chartMode variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="group">Grouped</ToggleOption>
			<ToggleOption value="stack">Stacked</ToggleOption>
			<ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
