<script lang="ts">
  import { onMount } from 'svelte';
  import { WebContainer } from '@webcontainer/api';
  import { templateProjectFiles } from "./templateProject.ts";

  let iframeEl;
  let webcontainerInstance;


  onMount(async () => {
    webcontainerInstance = await WebContainer.boot();

    if (!webcontainerInstance) {
      throw new Error('Failed to boot WebContainer');
    }
    await webcontainerInstance.mount(projectFiles);

    webcontainerInstance.on('server-ready', (port, url) => {
      if (iframeEl) {
        iframeEl.src = url;
      }
    });

    await startDevServer();
  });

  async function startDevServer() {
    if (!webcontainerInstance) {
      throw new Error('WebContainer instance not initialized');
    }

    // Install dependencies
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);
    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error('Unable to run npm install');
    }

    // Start dev server
    await webcontainerInstance.spawn('npm', ['run', 'dev']);
  }
</script>

<div class="h-screen -mx-6 -my-4 lg:-mx-20 lg:-my-8">
  <iframe
    bind:this={iframeEl}
    title="LayerChart Playground"
    class="w-full h-full border-none"
    allowfullscreen
  ></iframe>
</div>