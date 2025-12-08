<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	const source =
		` <script lang="ts">
  import { toTitleCase } from '@layerstack/utils';

	const str = 'string of text';
	</` +
		`script>

	{toTitleCase(str)}`;
</script>

<Code {source} language="js" copyButton={false} lang="ts" />
