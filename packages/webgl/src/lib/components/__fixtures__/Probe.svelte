<script lang="ts">
  import { getChartContext, type ChartState } from 'layerchart';
  import { getSceneContext, type SceneState } from '../../contexts/scene.svelte.js';

  let { onScene }: { onScene: (scene: SceneState, chart: ChartState<any>) => void } = $props();

  // svelte-ignore state_referenced_locally
  onScene(getSceneContext(), getChartContext());
</script>
