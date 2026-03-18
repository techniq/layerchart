<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { ChordGroup, Chord } from 'd3-chord';

  export type ChordProps = {
    /**
     * The input adjacency matrix for the chord layout.
     */
    matrix: number[][];

    /**
     * The variant of chord layout to use.
     *
     * - `'default'` - symmetric chord layout (d3.chord)
     * - `'directed'` - directed/asymmetric chord layout (d3.chordDirected)
     * - `'transpose'` - transpose chord layout, highlights outgoing (d3.chordTranspose)
     *
     * @default 'default'
     */
    variant?: 'default' | 'directed' | 'transpose';

    /**
     * The angular padding between adjacent groups in radians.
     *
     * @default 0
     */
    padAngle?: number;

    /**
     * A comparator function to sort groups.
     */
    sortGroups?: ((a: number, b: number) => number) | null;

    /**
     * A comparator function to sort subgroups within each group.
     */
    sortSubgroups?: ((a: number, b: number) => number) | null;

    /**
     * A comparator function to sort chords.
     */
    sortChords?: ((a: number, b: number) => number) | null;

    /**
     * Multiplier for inner radius relative to outerRadius.
     *
     * @default 0.9
     */
    innerRadiusRatio?: number;

    children?: Snippet<
      [
        {
          groups: ChordGroup[];
          chords: Chord[];
          innerRadius: number;
          outerRadius: number;
        },
      ]
    >;
  };
</script>

<script lang="ts">
  import { chord as d3Chord, chordDirected, chordTranspose } from 'd3-chord';

  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    matrix,
    variant = 'default',
    padAngle = 0,
    sortGroups = null,
    sortSubgroups = null,
    sortChords = null,
    innerRadiusRatio = 0.9,
    children,
  }: ChordProps = $props();

  const ctx = getChartContext();

  const outerRadius = $derived(Math.min(ctx.width, ctx.height) / 2);
  const innerRadius = $derived(outerRadius * innerRadiusRatio);

  const chordLayout = $derived.by(() => {
    const generator =
      variant === 'directed'
        ? chordDirected()
        : variant === 'transpose'
          ? chordTranspose()
          : d3Chord();

    generator.padAngle(padAngle);

    if (sortGroups != null) {
      generator.sortGroups(sortGroups);
    }
    if (sortSubgroups != null) {
      generator.sortSubgroups(sortSubgroups);
    }
    if (sortChords != null) {
      generator.sortChords(sortChords);
    }

    return generator(matrix);
  });
</script>

{@render children?.({
  groups: chordLayout.groups,
  chords: chordLayout,
  innerRadius,
  outerRadius,
})}
