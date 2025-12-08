<script lang="ts">
	import Code from '$lib/components/Code.svelte';
	import { cls } from '@layerstack/tailwind';

	const clsSource = [
		'<script lang="ts">',
		"  import { cls } from '@layerstack/tailwind';",
		'</' + 'script>',
		'',
		"<div class={cls('h-10 bg-red-500', true && 'bg-green-500')}>...</div>",
		'// becomes <div class="h-10 bg-green-500"></div>'
	].join('\n');
</script>

<Code source={clsSource} language="js" copyButton={false} />
