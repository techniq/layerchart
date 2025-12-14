<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	const clsSource = [
		'<script lang="ts">',
		"  import { cls } from '@layerstack/tailwind';",
		'</' + 'script>',
		'',
		"<div class={cls('bg-error-500', true && 'bg-success-500')}>...</div>",
		'// becomes <div class="bg-success-500"></div>'
	].join('\n');
</script>

<Code source={clsSource} language="js" copyButton={false} />
