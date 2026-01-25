<script lang="ts">
	import { cls } from '@layerstack/tailwind';
</script>

<div class={cls('text-center p-2 bg-error-500', true && 'bg-success-500')}>
	{`class={cls('bg-error-500', true && 'bg-success-500')}`}<br />becomes<br />class="bg-success-500"
</div>
