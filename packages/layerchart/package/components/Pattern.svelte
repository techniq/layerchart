<script>// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern
// https://airbnb.io/visx/patterns
// https://github.com/airbnb/visx/tree/master/packages/visx-pattern/src/patterns
export let id;
export let width;
export let height;
</script>

<defs>
	<pattern {id} {width} {height} patternUnits="userSpaceOnUse" {...$$restProps}>
		<slot />
	</pattern>
</defs>
