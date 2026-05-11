<script lang="ts">
	let { children } = $props();
</script>

<strong class="text-[initial] font-medium">{@render children?.()}</strong>
