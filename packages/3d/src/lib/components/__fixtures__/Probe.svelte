<script lang="ts">
  import { getSceneContext, type SceneState } from '../../contexts/scene.svelte.js';

  let { onScene }: { onScene: (scene: SceneState) => void } = $props();

  // svelte-ignore state_referenced_locally
  onScene(getSceneContext());
</script>
