<script lang="ts" module>
	import type { SVGAttributes } from 'svelte/elements';
	import type { ComponentProps } from 'svelte';

	export type NestedPropsWithoutHTML = {
		/**
		 * Label text
		 */
		label?: string;

		/**
		 * Props for nested elements
		 */
		props?: {
			/**
			 * Label properties
			 */
			label?: Partial<ComponentProps<any>>;

			/**
			 * Line properties
			 */
			line?: Partial<ComponentProps<any>>;
		};

		/**
		 * Classes for styling
		 *
		 * @default {}
		 */
		classes?: {
			root?: string;
			label?: string;
			line?: string;
		};
	};

	export type NestedProps = NestedPropsWithoutHTML & SVGAttributes<SVGElement>;
</script>

<script lang="ts">
	const { label, props, classes }: NestedProps = $props();
</script>

<div class={classes?.root}>
	<span class={classes?.label}>{label}</span>
</div>
