<script lang="ts">
	let {
		kind,
		message,
		line,
		column
	}: {
		/** A compile error, or one thrown while mounting the build. */
		kind: 'compile' | 'runtime';
		message: string;
		line?: number;
		column?: number;
	} = $props();
</script>

<!--
	Sits over the preview rather than replacing it: the last successful build stays mounted
	underneath (dimmed, to read as stale) so you can still see what you were working on while
	fixing the typo. `pointer-events-none` keeps the stale chart's tooltips from responding to
	a hover it can no longer answer correctly.
-->
<div
	class="absolute inset-0 z-20 overflow-auto border-t-2 border-danger bg-surface-100/80 dark:bg-surface-200/80 p-4 backdrop-blur-[1px] pointer-events-none screenshot-hidden"
	role="alert"
>
	<div class="text-base font-semibold text-surface-content">
		Error {kind === 'compile' ? 'compiling' : 'running'} Example.svelte
	</div>

	<pre
		class="mt-2 max-w-full overflow-auto rounded-sm bg-surface-300/80 p-2 font-mono text-xs whitespace-pre-wrap text-danger">{message}</pre>

	{#if line != null}
		<div class="mt-1 text-[10px] text-surface-content/50">
			line {line}{#if column != null}&nbsp;column {column}{/if}
		</div>
	{/if}
</div>
