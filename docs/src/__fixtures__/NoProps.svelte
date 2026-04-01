<script lang="ts" module>
	// This component doesn't have PropsWithoutHTML type
	// and should be skipped by the extraction
	export type NoPropsType = {
		value: string;
	};
</script>

<script lang="ts">
	const { value }: NoPropsType = $props();
</script>

<div>{value}</div>
