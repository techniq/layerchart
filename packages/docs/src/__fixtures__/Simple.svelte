<script lang="ts" module>
	import type { SVGAttributes } from 'svelte/elements';

	export type SimplePropsWithoutHTML = {
		/**
		 * The x-coordinate
		 *
		 * @default 0
		 */
		x?: number;

		/**
		 * The y-coordinate
		 *
		 * @default 0
		 */
		y?: number;

		/**
		 * The width (required)
		 */
		width: number;

		/**
		 * The height (required)
		 */
		height: number;

		/**
		 * Fill color
		 */
		fill?: string;

		/**
		 * A bindable reference
		 *
		 * @bindable
		 */
		ref?: SVGElement;
	};

	export type SimpleProps = SimplePropsWithoutHTML & SVGAttributes<SVGElement>;
</script>

<script lang="ts">
	const { x = 0, y = 0, width, height, fill, ref }: SimpleProps = $props();
</script>

<rect {x} {y} {width} {height} {fill} />
