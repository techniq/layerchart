
<!--
	@component
	## BrushContext

	## Description

	Interaction component providing an interactive brush context allowing selection, adjustment, and resetting of x/y domains with draggable handles and event callbacks.

	## Category

	[[Interactions](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Interactions.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [BrushContext](/docs/components/BrushContext)

	## API Properties

	* axis:<'x' | 'y' | 'both'>='x' - The axis to apply brushing 
	* handleSize:<number>=5 - Size of the draggable handles (width/height) 
	* resetOnEnd:<boolean>=false - Only show range while actively brushing.
Useful with `brushEnd` event 
	* ignoreResetClick:<boolean>=false - Ignore click to reset.
Useful to add click handlers to marks.  Requires external resetting (button, another chart, etc) 
	* xDomain:<DomainType> - undefined 
	* yDomain:<DomainType> - undefined 
	* mode:<'integrated' | 'separated'>='integrated' - Mode of operation
 - `integrated`: use with single chart
 - `separated`: use with separate (typically smaller) chart and state can be managed
externally (sync with other charts, etc).  Show active selection when domain does not equal
original 
	* disabled:<boolean>=false - Disable brush 
	* range:<Partial<HTMLAttributes<HTMLElement>>> - Attributes passed to the range <div> element 
	* handle:<Partial<HTMLAttributes<HTMLElement>>> - Attributes passed to the handle <div> elements 
	* classes:<{ root?: string; frame?: string; range?: string; handle?: string; labels?: string; }>={} - Classes to apply to the various elements rendered 
	* onChange:<(detail: BrushEventPayload) => void> - undefined 
	* onBrushStart:<(detail: BrushEventPayload) => void> - undefined 
	* onBrushEnd:<(detail: BrushEventPayload) => void> - undefined 
	* onReset:<(detail: BrushEventPayload) => void> - undefined 
	* brushContext:<BrushContextValue> - A reference to this brush's context for use in parent
components. 
	* children:<Snippet<[ { brushContext: BrushContextValue; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { Area, Chart, Layer } from 'layerchart';
		import { getAppleStock } from '$lib/data.remote';

		const data = await getAppleStock();
	</script>

	<Chart {data} x="date" y="value" brush height={40}>
		<Layer>
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
		</Layer>
	</Chart>
	```
-->
