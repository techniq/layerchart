<script lang="ts">
	import { getContext } from 'svelte';
	import { pack as d3Pack } from 'd3-hierarchy';

	const { data, width, height } = getContext('LayerCake');

	export let size: [number, number] | undefined = undefined;

	/**
	 * see: https://github.com/d3/d3-hierarchy#pack_padding
	 */
	export let padding: number | undefined = undefined;

	let pack: ReturnType<typeof d3Pack>;
	$: {
		pack = d3Pack().size(size ?? [$width, $height]);

		if (padding) {
			pack.padding(padding);
		}
	}

	$: packData = pack($data);
</script>

<slot nodes={packData.descendants()} />
