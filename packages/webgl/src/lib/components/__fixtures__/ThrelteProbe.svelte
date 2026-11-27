<script lang="ts">
  import { useThrelte } from '@threlte/core';
  import type { Camera, Scene, WebGLRenderer } from 'three';
  import { getSceneContext, type SceneState } from '../../contexts/scene.svelte.js';

  let {
    onThrelte,
  }: {
    onThrelte: (threlte: {
      scene: SceneState;
      render: () => void;
      renderer: WebGLRenderer;
    }) => void;
  } = $props();

  const { renderer, scene, camera } = useThrelte();
  const sceneState = getSceneContext();

  // svelte-ignore state_referenced_locally
  onThrelte({
    scene: sceneState,
    renderer: renderer as WebGLRenderer,
    // A frame drawn now, to read its pixels before the browser shows it
    render: () => (renderer as WebGLRenderer).render(scene as Scene, camera.current as Camera),
  });
</script>
