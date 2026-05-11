<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import JsonTree from '@sveltejs/svelte-json-tree';
	import { cls } from '@layerstack/tailwind';

	const {
		value,
		defaultExpandedPaths = ['$'],
		class: className
	}: {
		value: ComponentProps<JsonTree>['value'];
		defaultExpandedPaths?: ComponentProps<JsonTree>['defaultExpandedPaths'];
		class?: string;
	} = $props();
</script>

<div class={cls('overflow-auto px-4 py-2 bg-surface-200', className)}>
	<JsonTree
		{value}
		{defaultExpandedPaths}
		shouldTreatIterableAsObject
		--json-tree-property-color="var(--color-primary)"
		--json-tree-string-color="var(--color-secondary)"
		--json-tree-symbol-color="var(--color-secondary)"
		--json-tree-boolean-color="var(--color-secondary)"
		--json-tree-function-color="var(--color-secondary)"
		--json-tree-number-color="var(--color-secondary)"
		--json-tree-label-color="var(--color-secondary)"
		--json-tree-arrow-color="var(--color-surface-content)"
		--json-tree-null-color="var(--color-surface-content)"
		--json-tree-undefined-color="var(--color-surface-content)"
		--json-tree-date-color="var(--color-surface-content)"
		--json-tree-operator-color="var(--color-surface-content)"
		--json-tree-regex-color="var(--color-surface-content)"
	/>
</div>
