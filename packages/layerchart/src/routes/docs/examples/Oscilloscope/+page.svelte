<script lang="ts">
  import { scaleBand, scaleLinear, scaleSequential } from 'd3-scale';
  import { range, ticks } from 'd3-array';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import Spline from '$lib/components/Spline.svelte';
  import { curveCardinal } from 'd3-shape';

  // Inspired by: https://observablehq.com/@visnup/microphone-oscilloscope and https://codepen.io/agalliat/pen/PoZLBxP

  let timeData: { key: number; value: number }[] = [];
  let frequencyData: { key: number; value: number }[] = [];

  let ctx: AudioContext;
  let analyser: AnalyserNode;

  $: frequency = scaleLinear()
    .domain([0, analyser?.frequencyBinCount - 1])
    .range([0, analyser?.context.sampleRate / 2 / 1000]);

  $: decibels = scaleLinear()
    .domain([0, 255])
    .range([analyser?.minDecibels, analyser?.maxDecibels]);

  let active = true;
  onMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = ctx
      .createMediaStreamSource(stream)
      .connect(new AnalyserNode(ctx, { fftSize: 2048 }));

    const time = new Uint8Array(analyser.fftSize);
    const frequency = new Uint8Array(analyser.frequencyBinCount);

    let start: DOMHighResTimeStamp;

    function step(timeStamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timeStamp;
      }
      const elapsed = timeStamp - start;

      analyser.getByteTimeDomainData(time);
      analyser.getByteFrequencyData(frequency);
      frequencyData = [...frequency].map((value, i) => ({ key: i, value }));
      timeData = [...time].map((value, i) => ({ key: i, value }));

      if (active) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });

  onDestroy(() => {
    active = false;
    ctx?.close();
  });

  const colorScale = scaleSequential([0, 256], interpolateTurbo);
</script>

<h1>Examples</h1>

<h2>Time</h2>

<Preview>
  <div class="h-[100px] p-4 border rounded">
    <Chart data={timeData} x={(d) => d.key} y={(d) => d.value} yDomain={[0, 256]}>
      <Svg>
        <Spline curve={curveCardinal} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Frequency</h2>

<Preview>
  <div class="h-[150px] p-4 border rounded">
    <Chart
      data={frequencyData}
      x={(d) => d.key}
      xScale={scaleBand().padding(0.3)}
      xDomain={range(0, 128)}
      y={(d) => d.value}
      yDomain={[0, 256]}
      yNice
      padding={{ left: 24, bottom: 0 }}
    >
      <Svg>
        <Axis placement="left" format={(d) => decibels(d)?.toFixed(1)} grid rule />
        <Axis
          placement="bottom"
          format={(d) => ''}
          _format={(d) => frequency(d)?.toFixed(1)}
          tickLength={0}
          rule
        />
        <LinearGradient
          stops={ticks(1, 0, 10).map(colorScale.interpolator())}
          vertical
          units="userSpaceOnUse"
          let:url
        >
          <Bars radius={1} fill={url} />
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>
