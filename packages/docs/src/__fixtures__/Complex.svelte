<script lang="ts" module>
	import type { SVGAttributes } from 'svelte/elements';

	export type ComplexPropsWithoutHTML = {
		/**
		 * Whether to enable feature
		 *
		 * @default false
		 */
		enabled?: boolean;

		/**
		 * Position mode
		 *
		 * @default 'relative'
		 */
		position?: 'relative' | 'absolute' | 'fixed';

		/**
		 * Configuration object with multiple nested levels
		 */
		config?: {
			/**
			 * Display settings
			 */
			display?: {
				show?: boolean;
				mode?: 'auto' | 'manual';
			};
			/**
			 * Size constraints
			 */
			constraints?: {
				minWidth?: number;
				maxWidth?: number;
				minHeight?: number;
				maxHeight?: number;
			};
		};

		/**
		 * Array of values
		 */
		values?: number[];

		/**
		 * Generic type property
		 */
		data?: Array<{ id: string; value: number }>;

		/**
		 * Multi-line description that spans
		 * across multiple lines to test
		 * proper JSDoc extraction
		 *
		 * @default null
		 */
		metadata?: Record<string, any>;

		/**
		 * Callback function
		 */
		onUpdate?: (value: number) => void;

		/**
		 * Required callback
		 */
		onChange: (event: Event) => void;

		/**
		 * Optional with tag
		 *
		 * @experimental
		 */
		experimental?: boolean;
	};

	export type ComplexProps = ComplexPropsWithoutHTML & SVGAttributes<SVGElement>;
</script>

<script lang="ts">
	const {
		enabled = false,
		position = 'relative',
		config,
		values,
		data,
		metadata,
		onUpdate,
		onChange,
		experimental
	}: ComplexProps = $props();
</script>

<div>Complex component</div>
