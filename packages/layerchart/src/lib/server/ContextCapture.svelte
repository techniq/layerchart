<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getCanvasContext } from '$lib/contexts/canvas.js';
  import { setSSRCapture, type CaptureTarget } from './captureStore.js';

  let {
    capture,
    onCapture,
  }: {
    capture?: CaptureTarget;
    onCapture?: (data: CaptureTarget) => void;
  } = $props();

  const chartState = getChartContext();
  const canvasCtx = getCanvasContext();

  const captured = {
    chartState,
    rootNode: canvasCtx.getRootNode?.(),
  };

  if (typeof window === 'undefined') {
    if (capture) {
      Object.assign(capture, captured);
    }

    setSSRCapture(captured);
    onCapture?.(captured);
  }
</script>
