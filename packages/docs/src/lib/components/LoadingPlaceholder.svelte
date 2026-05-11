<script lang="ts">
	import { ProgressCircle } from 'svelte-ux';
</script>

<div class="flex flex-col items-center justify-center gap-3 py-20">
	<ProgressCircle size={24} width={2} />
	<span class="text-sm text-surface-content/50">Loading...</span>
</div>
