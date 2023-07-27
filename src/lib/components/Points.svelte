<script lang="ts">
  import { getContext } from 'svelte';

  import Circle from './Circle.svelte';
  import { isScaleBand } from '../utils/scales';
  import { notNull } from 'svelte-ux';

  const context = getContext('LayerCake') as any;
  const { data, xGet, y, yGet, xScale, yScale, rGet, config } = context;

  type Offset = number | ((value: number, context: any) => number);

  export let r = 5;
  export let offsetX: Offset = undefined;
  export let offsetY: Offset = undefined;

  function getOffset(value, offset: Offset, scale: any) {
    if (typeof offset === 'function') {
      return offset(value, context);
    } else if (offset != null) {
      return offset;
    } else if (isScaleBand(scale)) {
      return scale.bandwidth() / 2;
    } else {
      return 0;
    }
  }

  $: points = $data.flatMap((d) => {
    if (Array.isArray($config.x)) {
      /*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
      return $xGet(d)
        .filter(notNull)
        .map((x) => {
          return {
            x: x + getOffset(x, offsetX, $xScale),
            y: $yGet(d) + getOffset($yGet(d), offsetY, $yScale),
            data: d,
          };
        });
    } else if (Array.isArray($config.y)) {
      /*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
      return $yGet(d)
        .filter(notNull)
        .map((y) => {
          return {
            x: $xGet(d) + getOffset($xGet(d), offsetX, $xScale),
            y: y + getOffset(y, offsetY, $yScale),
            data: d,
          };
        });
    } else {
      /*
				x="prop1"
				y="prop2"
			*/
      return {
        x: $xGet(d) + getOffset($xGet(d), offsetX, $xScale),
        y: $yGet(d) + getOffset($yGet(d), offsetY, $yScale),
        data: d,
      };
    }
  });
</script>

<slot {points}>
  <g class="point-group">
    {#each points as point, index}
      <Circle
        cx={point.x}
        cy={point.y}
        {r}
        fill={$config.r ? $rGet(point.data) : null}
        {...$$restProps}
      />
    {/each}
  </g>
</slot>
