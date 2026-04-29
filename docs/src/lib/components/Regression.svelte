<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import type { Without } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  export type RegressionType =
    | 'linear'
    | 'quad'
    | 'polynomial'
    | 'exponential'
    | 'logarithmic'
    | 'power'
    | 'loess';

  export type RegressionPropsWithoutHTML = {
    /**
     * Override data instead of using chart context
     */
    data?: any[];

    /**
     * Override x accessor from Chart context
     */
    x?: import('layerchart').Accessor;

    /**
     * Override y accessor from Chart context
     */
    y?: import('layerchart').Accessor;

    /**
     * Regression algorithm to apply
     * @default 'linear'
     */
    type?: RegressionType;

    /**
     * Independent variable axis.
     * 'x' = standard (Y ~ X), 'y' = inverted (X ~ Y)
     * @default 'x'
     */
    direction?: 'x' | 'y';

    /**
     * Polynomial order, only used when type='polynomial'
     * @default 3
     */
    order?: number;

    /**
     * LOESS bandwidth (0–1), only used when type='loess'
     * @default 0.3
     */
    bandwidth?: number;

    /**
     * Confidence level for the confidence band (0–1), e.g. 0.95 for 95% CI.
     * Only supported for linear regression (type='linear').
     */
    confidence?: number;

    /**
     * Sub-component styling overrides.
     */
    props?: {
      line?: { class?: string };
      confidence?: { class?: string };
    };
  };

  export type RegressionProps = RegressionPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, RegressionPropsWithoutHTML>;
</script>

<script lang="ts">
  import { line, area } from 'd3-shape';
  import { sum } from 'd3-array';
  import { getChartContext, accessor, ChartClipPath, Path, Chart, Layer } from 'layerchart';
  import type { PathProps } from 'layerchart';
  import {
    regressionLinear,
    regressionQuad,
    regressionPoly,
    regressionExp,
    regressionLog,
    regressionPow,
    regressionLoess,
  } from 'd3-regression';

  const ctx = getChartContext();

  let {
    data,
    x,
    y,
    type = 'linear',
    direction = 'x',
    order = 3,
    bandwidth = 0.3,
    confidence,
    props,
    ...restProps
  }: RegressionProps = $props();

  const xAccessor = $derived(accessor(x ?? ctx.x));
  const yAccessor = $derived(accessor(y ?? ctx.y));

  function toNum(v: unknown): number {
    if (v instanceof Date) return v.getTime();
    return +(v as number);
  }

  // Wichura (1988): normal deviate for lower tail probability p
  function normdev(p: number): number {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a0=3.3871328727963665,a1=133.14166789178438,a2=1971.5909503065513,a3=13731.69376550946,a4=45921.95393154987,a5=67265.7709270087,a6=33430.57558358813,a7=2509.0809287301227;
    const b1=42.31333070160091,b2=687.1870074920579,b3=5394.196021424751,b4=21213.794301586597,b5=39307.89580009271,b6=28729.085735721943,b7=5226.495278852854;
    const c0=1.4234371107496835,c1=4.630337846156546,c2=5.769497221460691,c3=3.6478483247632045,c4=1.2704582524523684,c5=0.2417807251774506,c6=0.022723844989269184,c7=0.0007745450142783414;
    const d1=2.053191626637759,d2=1.6763848301838038,d3=0.6897673349851,d4=0.14810397642748008,d5=0.015198666563616457,d6=0.0005475938084995345,d7=1.0507500716444169e-9;
    const e0=6.657904643501103,e1=5.463784911164114,e2=1.7848265399172913,e3=0.29656057182850487,e4=0.026532189526576124,e5=0.0012426609473880784,e6=0.000027115555687434876,e7=2.0103343992922881e-7;
    const f1=0.599832206555888,f2=0.1369298809227358,f3=0.014875361290850615,f4=0.0007868691311456133,f5=0.000018463183175100548,f6=1.421511758316446e-7,f7=2.0442631033899397e-15;
    const q = p - 0.5;
    let r: number, z: number;
    if (Math.abs(q) <= 0.425) {
      r = 0.180625 - q * q;
      z = (q*(((((((a7*r+a6)*r+a5)*r+a4)*r+a3)*r+a2)*r+a1)*r+a0))/(((((((b7*r+b6)*r+b5)*r+b4)*r+b3)*r+b2)*r+b1)*r+1);
      return z;
    }
    r = Math.sqrt(-Math.log(q > 0 ? 1 - p : p));
    if (r <= 5) {
      r -= 1.6;
      z = (((((((c7*r+c6)*r+c5)*r+c4)*r+c3)*r+c2)*r+c1)*r+c0)/(((((((d7*r+d6)*r+d5)*r+d4)*r+d3)*r+d2)*r+d1)*r+1);
    } else {
      r -= 5;
      z = (((((((e7*r+e6)*r+e5)*r+e4)*r+e3)*r+e2)*r+e1)*r+e0)/(((((((f7*r+f6)*r+f5)*r+f4)*r+f3)*r+f2)*r+f1)*r+1);
    }
    return q < 0 ? -z : z;
  }

  // Hill (1970): inverse t-distribution for two-tail probability p with df degrees of freedom
  function inverseT(p: number, df: number): number {
    const { sin, cos, sqrt, pow, exp, PI } = Math;
    if (df === 1) return cos((p * PI) / 2) / sin((p * PI) / 2);
    if (df === 2) return sqrt(2 / (p * (2 - p)) - 2);
    const a = 1 / (df - 0.5);
    const b = 48 / (a * a);
    let c = (((20700 * a) / b - 98) * a - 16) * a + 96.36;
    const d = ((94.5 / (b + c) - 3) / b + 1) * sqrt(a * PI * 0.5) * df;
    let x: number = d * p;
    let yv = pow(x, 2 / df);
    if (yv > 0.05 + a) {
      x = normdev(p / 2);
      yv = x * x;
      if (df < 5) c = c + 0.3 * (df - 4.5) * (x + 0.6);
      c = (((0.05 * d * x - 5) * x - 7) * x - 2) * x + b + c;
      yv = (((((0.4 * yv + 6.3) * yv + 36) * yv + 94.5) / c - yv - 3) / b + 1) * x;
      yv = a * yv * yv;
      yv = yv > 0.002 ? exp(yv) - 1 : 0.5 * yv * yv + yv;
    } else {
      yv = (((1 / (((df + 6) / (df * yv) - 0.089 * d - 0.822) * (df + 2) * 3) + 0.5 / (df + 4)) * yv - 1) * (df + 1)) / (df + 2) + 1 / yv;
    }
    return sqrt(df * yv);
  }

  type RegressionResult = [number, number][] & { predict?: (x: number) => number };

  const regressionResult = $derived.by((): { points: [number, number][]; predict?: (x: number) => number } => {
    const rawData = data ?? ctx.data;
    const raw = Array.isArray(rawData) ? Array.from(rawData) : [];
    if (raw.length === 0) return { points: [] };

    const filtered = raw.filter((d) => {
      const xv = xAccessor(d);
      const yv = yAccessor(d);
      return xv != null && yv != null && !Number.isNaN(toNum(xv)) && !Number.isNaN(toNum(yv));
    });
    if (filtered.length < 2) return { points: [] };

    const isSwapped = direction === 'y';

    const indAcc = (d: unknown) =>
      toNum(isSwapped ? yAccessor(d) : xAccessor(d));
    const depAcc = (d: unknown) =>
      toNum(isSwapped ? xAccessor(d) : yAccessor(d));

    const scaleDomain = isSwapped ? ctx.yScale.domain() : ctx.xScale.domain();
    const domain: [number, number] = [toNum(scaleDomain[0]), toNum(scaleDomain[1])];

    let regFn: any;
    switch (type) {
      case 'quad':
        regFn = regressionQuad();
        break;
      case 'polynomial':
        regFn = regressionPoly().order(order);
        break;
      case 'exponential':
        regFn = regressionExp();
        break;
      case 'logarithmic':
        regFn = regressionLog();
        break;
      case 'power':
        regFn = regressionPow();
        break;
      case 'loess':
        regFn = regressionLoess().bandwidth(bandwidth);
        break;
      default:
        regFn = regressionLinear();
    }

    regFn.x(indAcc).y(depAcc);
    if (type !== 'loess') {
      regFn.domain(domain);
    }

    const result: RegressionResult = regFn(filtered);

    let points: [number, number][] = result;
    if (isSwapped) {
      points = result.map(([yi, xi]) => [xi, yi]);
    }

    return { points, predict: result.predict };
  });

  const pathData = $derived.by(() => {
    const pts = regressionResult.points.filter(([, y]) => isFinite(y));
    if (pts.length < 2) return '';
    const lineGen = line<[number, number]>()
      .x((d) => ctx.xScale(d[0]) ?? 0)
      .y((d) => ctx.yScale(d[1]) ?? 0)
      .defined(([, y]) => isFinite(ctx.yScale(y) ?? NaN));
    return lineGen(pts) ?? '';
  });

  const confidenceBandPath = $derived.by(() => {
    if (!confidence || confidence <= 0 || confidence >= 1) return '';
    if (type !== 'linear') return '';
    if (direction !== 'x') return '';
    const { points: pts, predict } = regressionResult;
    if (!predict || pts.length < 2) return '';

    const rawData = data ?? ctx.data;
    const raw = Array.isArray(rawData) ? Array.from(rawData) : [];
    const filtered = raw.filter((d) => {
      const xv = xAccessor(d);
      const yv = yAccessor(d);
      return xv != null && yv != null && !Number.isNaN(toNum(xv)) && !Number.isNaN(toNum(yv));
    });
    if (filtered.length < 3) return '';

    const xyData = filtered.map((d) => ({
      x: toNum(xAccessor(d)),
      y: toNum(yAccessor(d)),
    }));

    const alpha = 1 - confidence;
    const mean = sum(xyData, (d) => d.x) / xyData.length;
    let a = 0, b = 0;
    for (const d of xyData) {
      a += Math.pow(d.x - mean, 2);
      b += Math.pow(d.y - predict(d.x), 2);
    }
    const sy = Math.sqrt(b / (xyData.length - 2));
    const t = inverseT(alpha, xyData.length - 2);

    const bandPoints = pts.map(([x]) => {
      const Y = predict(x);
      const se = sy * Math.sqrt(1 / xyData.length + Math.pow(x - mean, 2) / a);
      return { x, y0: Y - t * se, y1: Y + t * se };
    });

    const areaGen = area<{ x: number; y0: number; y1: number }>()
      .x((d) => ctx.xScale(d.x) ?? 0)
      .y0((d) => ctx.yScale(d.y0) ?? 0)
      .y1((d) => ctx.yScale(d.y1) ?? 0);

    return areaGen(bandPoints) ?? '';
  });
</script>

{#if pathData || confidenceBandPath}
<ChartClipPath>
    {#if pathData}
    <Path {pathData} class={props?.line?.class} {...(restProps as PathProps)} />
    {/if}
    {#if confidenceBandPath}
    <path
        d={confidenceBandPath}
        fill={(restProps.stroke as string) ?? 'currentColor'}
        class={cls("opacity-10", props?.confidence?.class)}
      />
    {/if}
  </ChartClipPath>
{/if}
