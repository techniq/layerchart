<script lang="ts">
	import { truncate } from '@layerstack/utils';

	const str = 'This is a really long string of text.';
</script>

{truncate(str, 21)}
