<script lang="ts" module>
	export {
		a,
		blockquote,
		code,
		h1,
		h2,
		h3,
		img,
		li,
		ol,
		p,
		pre,
		table,
		tr,
		th,
		td,
		ul
	} from '../../components';
</script>

<script lang="ts">
	import { type Snippet } from 'svelte';

	let { metadata, children }: { metadata: any; children: Snippet } = $props();
</script>

{@render children()}
