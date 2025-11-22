<script lang="ts" module>
	import type { SVGAttributes } from 'svelte/elements';

	type CommonStyleProps = {
		fill?: string;
		fillOpacity?: number;
		stroke?: string;
		strokeWidth?: number;
		strokeOpacity?: number;
		opacity?: number;
	};

	export type WithCommonStylePropsWithoutHTML = {
		/**
		 * The x position
		 *
		 * @default 0
		 */
		x?: number;

		/**
		 * The y position
		 *
		 * @default 0
		 */
		y?: number;

		/**
		 * The size
		 */
		size: number;
	} & CommonStyleProps;

	export type WithCommonStyleProps = WithCommonStylePropsWithoutHTML & SVGAttributes<SVGElement>;
</script>

<script lang="ts">
	const { x = 0, y = 0, size, fill, stroke, opacity }: WithCommonStyleProps = $props();
</script>

<rect {x} {y} width={size} height={size} {fill} {stroke} {opacity} />
