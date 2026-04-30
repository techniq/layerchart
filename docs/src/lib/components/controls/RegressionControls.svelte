<script lang="ts">
	import { SelectField } from 'svelte-ux';
	import type { RegressionType } from '../Regression.svelte';

	interface Props {
		type?: RegressionType;
		confidence?: number | undefined;
		bandwidth?: number;
	}

	let { type = $bindable('linear'), confidence = $bindable(undefined), bandwidth = $bindable(0.3) }: Props = $props();

	const bandwidthOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((v) => ({
		value: v,
		label: String(v),
	}));

	const regressionTypes: { value: RegressionType; label: string }[] = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'quad', label: 'Quadratic' },
		{ value: 'polynomial', label: 'Polynomial' },
		{ value: 'exponential', label: 'Exponential' },
		{ value: 'logarithmic', label: 'Logarithmic' },
		{ value: 'power', label: 'Power' },
		{ value: 'loess', label: 'LOESS' },
	];

	const confidenceLevels: { value: number | undefined; label: string }[] = [
		{ value: undefined, label: 'None' },
		{ value: 0.8, label: '80%' },
		{ value: 0.9, label: '90%' },
		{ value: 0.95, label: '95%' },
		{ value: 0.99, label: '99%' },
		{ value: 0.999, label: '99.9%' },
	];
</script>

<div class="mb-2 flex flex-col gap-2">
	<div class="flex gap-2">
		<SelectField
			label="Regression type"
			bind:value={type}
			options={regressionTypes}
			stepper
			clearable={false}
			toggleIcon={null}
		/>
	</div>
	<div class="flex gap-2">
		<SelectField
			label="Confidence (linear only)"
			bind:value={confidence}
			options={confidenceLevels}
			stepper
			clearable={false}
			toggleIcon={null}
			disabled={type !== 'linear'}
		/>
<SelectField
			label="Bandwidth (LOESS only)"
			bind:value={bandwidth}
			options={bandwidthOptions}
			stepper
			clearable={false}
			toggleIcon={null}
			disabled={type !== 'loess'}
		/>
	</div>
</div>
