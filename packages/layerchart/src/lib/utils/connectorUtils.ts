import {
  type CurveFactory,
  curveLinear,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line as d3Line,
  lineRadial,
  linkRadial,
} from 'd3-shape';

export type ConnectorCoords = {
  x: number;
  y: number;
};

export type PresetConnectorType = 'straight' | 'square' | 'beveled' | 'rounded';

export type ConnectorType = PresetConnectorType | 'd3';

export type ConnectorSweep = 'horizontal-vertical' | 'vertical-horizontal' | 'none';

function isSamePoint(p1: ConnectorCoords, p2: ConnectorCoords): boolean {
  return Math.abs(p1.x - p2.x) < 1e-6 && Math.abs(p1.y - p2.y) < 1e-6;
}

function createDirectPath(source: ConnectorCoords, target: ConnectorCoords): string {
  if (isSamePoint(source, target)) return '';
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

function isNearZero(value: number): boolean {
  return Math.abs(value) < 1e-6;
}

type CreateConnectorPathProps = {
  source: ConnectorCoords;
  target: ConnectorCoords;
  radius: number;
  sweep: ConnectorSweep;
  dx: number;
  dy: number;
};

function createSquarePath({ source, target, sweep }: CreateConnectorPathProps): string {
  if (sweep === 'horizontal-vertical') {
    return `M ${source.x} ${source.y} L ${target.x} ${source.y} L ${target.x} ${target.y}`;
  } else {
    return `M ${source.x} ${source.y} L ${source.x} ${target.y} L ${target.x} ${target.y}`;
  }
}

function createBeveledPath(opts: CreateConnectorPathProps): string {
  const { radius, dx, dy, source, target, sweep } = opts;
  const effectiveRadius = Math.max(0, Math.min(radius, Math.abs(dx), Math.abs(dy)));

  if (isNearZero(effectiveRadius)) {
    return createSquarePath(opts);
  }

  const signX = Math.sign(dx);
  const signY = Math.sign(dy);

  if (sweep === 'horizontal-vertical') {
    const pBeforeCorner = { x: target.x - effectiveRadius * signX, y: source.y };
    const pAfterCorner = { x: target.x, y: source.y + effectiveRadius * signY };

    return `M ${source.x} ${source.y} L ${pBeforeCorner.x} ${pBeforeCorner.y} L ${pAfterCorner.x} ${pAfterCorner.y} L ${target.x} ${target.y}`;
  } else {
    const pBeforeCorner = { x: source.x, y: target.y - effectiveRadius * signY };
    const pAfterCorner = { x: source.x + effectiveRadius * signX, y: target.y };

    return `M ${source.x} ${source.y} L ${pBeforeCorner.x} ${pBeforeCorner.y} L ${pAfterCorner.x} ${pAfterCorner.y} L ${target.x} ${target.y}`;
  }
}

function createRoundedPath(opts: CreateConnectorPathProps): string {
  const { radius, dx, dy, source, target, sweep } = opts;
  const effectiveRadius = Math.max(0, Math.min(radius, Math.abs(dx), Math.abs(dy)));

  if (isNearZero(effectiveRadius)) {
    return createSquarePath(opts);
  }

  const signX = Math.sign(dx);
  const signY = Math.sign(dy);

  if (sweep === 'horizontal-vertical') {
    const pBeforeCorner = { x: target.x - effectiveRadius * signX, y: source.y };
    const pAfterCorner = { x: target.x, y: source.y + effectiveRadius * signY };
    const sweepFlag = signX * signY > 0 ? 1 : 0;

    return `M ${source.x} ${source.y} L ${pBeforeCorner.x} ${pBeforeCorner.y} A ${effectiveRadius} ${effectiveRadius} 0 0 ${sweepFlag} ${pAfterCorner.x} ${pAfterCorner.y} L ${target.x} ${target.y}`;
  } else {
    const pBeforeCorner = { x: source.x, y: target.y - effectiveRadius * signY };
    const pAfterCorner = { x: source.x + effectiveRadius * signX, y: target.y };
    const sweepFlag = signX * signY > 0 ? 0 : 1;

    return `M ${source.x} ${source.y} L ${pBeforeCorner.x} ${pBeforeCorner.y} A ${effectiveRadius} ${effectiveRadius} 0 0 ${sweepFlag} ${pAfterCorner.x} ${pAfterCorner.y} L ${target.x} ${target.y}`;
  }
}

type PathStrategyMap = Record<
  'square' | 'beveled' | 'rounded',
  (props: CreateConnectorPathProps) => string
>;

const pathStrategies: PathStrategyMap = {
  square: createSquarePath,
  beveled: createBeveledPath,
  rounded: createRoundedPath,
};

type GetConnectorPresetPathProps = {
  source: ConnectorCoords;
  target: ConnectorCoords;
  radius: number;
  type: PresetConnectorType;
  sweep: ConnectorSweep;
};

export function getConnectorPresetPath(opts: GetConnectorPresetPathProps) {
  const { source, target, type } = opts;
  if (isSamePoint(source, target)) return '';
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // straight line cases
  if (type === 'straight' || isNearZero(dx) || isNearZero(dy)) {
    return createDirectPath(source, target);
  }

  return (pathStrategies[type] || pathStrategies.square)({ ...opts, dx, dy });
}

const FALLBACK_PATH = 'M0,0L0,0';

type GetConnectorD3PathProps = Omit<GetConnectorPresetPathProps, 'radius' | 'type'> & {
  curve: CurveFactory;
};

export function getConnectorD3Path({ source, target, sweep, curve }: GetConnectorD3PathProps) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const line = d3Line().curve(curve);
  let points: [number, number][] = [];

  const isAligned = isNearZero(dx) || isNearZero(dy);

  if (sweep === 'none' || isAligned) {
    points = [
      [source.x, source.y],
      [target.x, target.y],
    ];
  } else if (sweep === 'horizontal-vertical') {
    points = [
      [source.x, source.y],
      [target.x, source.y],
      [target.x, target.y],
    ];
  } else if (sweep === 'vertical-horizontal') {
    points = [
      [source.x, source.y],
      [source.x, target.y],
      [target.x, target.y],
    ];
  }

  if (points.length === 2 && isNearZero(dx) && isNearZero(dx)) return FALLBACK_PATH;

  const d = line(points);

  if (!d || d.includes('NaN')) return FALLBACK_PATH;

  return d;
}

// --- Radial variants --------------------------------------------------------
// In radial mode, `source`/`target` carry polar coords: `x` = angle, `y` = radius.
// Angles follow d3 tree convention (0 = up); visx's math subtracts PI/2 so 0 = +x axis.

type RadialGeometry = {
  sa: number;
  sr: number;
  ta: number;
  tr: number;
  sc: number;
  ss: number;
  tc: number;
  ts: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  sweepFlag: 0 | 1;
};

function radialGeometry(source: ConnectorCoords, target: ConnectorCoords): RadialGeometry {
  const sa = source.x - Math.PI / 2;
  const sr = source.y;
  const ta = target.x - Math.PI / 2;
  const tr = target.y;
  const sc = Math.cos(sa);
  const ss = Math.sin(sa);
  const tc = Math.cos(ta);
  const ts = Math.sin(ta);
  const sweepFlag: 0 | 1 =
    Math.abs(ta - sa) > Math.PI ? (ta <= sa ? 1 : 0) : ta > sa ? 1 : 0;
  return {
    sa,
    sr,
    ta,
    tr,
    sc,
    ss,
    tc,
    ts,
    sx: sr * sc,
    sy: sr * ss,
    tx: tr * tc,
    ty: tr * ts,
    sweepFlag,
  };
}

type GetConnectorRadialPresetPathProps = {
  source: ConnectorCoords;
  target: ConnectorCoords;
  type: PresetConnectorType;
  radius: number;
};

export function getConnectorRadialPresetPath({
  source,
  target,
  type,
  radius,
}: GetConnectorRadialPresetPathProps): string {
  const g = radialGeometry(source, target);
  const { sr, ta, tr, sc, ss, tc, ts, sx, sy, tx, ty, sweepFlag } = g;

  if (type === 'straight') {
    return `M${sx},${sy}L${tx},${ty}`;
  }

  if (type === 'rounded') {
    // visx LinkRadialCurve: cubic Bezier with rotated offset (percent controls tension)
    const percent = 0.2;
    const dx = tx - sx;
    const dy = ty - sy;
    const ix = percent * (dx + dy);
    const iy = percent * (dy - dx);
    return `M${sx},${sy}C${sx + ix},${sy + iy} ${tx + iy},${ty - ix} ${tx},${ty}`;
  }

  if (type === 'square') {
    // Source at origin — degenerate arc, just radial to target
    if (sr < 1e-6) return `M${sx},${sy}L${tx},${ty}`;
    // Step at midpoint radius: radial + arc + radial
    const mr = (sr + tr) / 2;
    const p1x = mr * sc;
    const p1y = mr * ss;
    const p2x = mr * tc;
    const p2y = mr * ts;
    return `M${sx},${sy}L${p1x},${p1y}A${mr},${mr},0,0,${sweepFlag},${p2x},${p2y}L${tx},${ty}`;
  }

  // 'beveled': visx-style step with chord at source radius and chamfered corner
  const cornerX = sr * tc;
  const cornerY = sr * ts;
  const chordDx = cornerX - sx;
  const chordDy = cornerY - sy;
  const chordLen = Math.hypot(chordDx, chordDy);

  if (chordLen < 1e-6) {
    // Source at origin — chord degenerates, just radial to target
    return `M${sx},${sy}L${tx},${ty}`;
  }

  const radialLen = Math.abs(tr - sr) || 1;
  const r = Math.max(0, Math.min(radius, chordLen, radialLen));
  const cux = chordDx / chordLen;
  const cuy = chordDy / chordLen;
  const radialDir = Math.sign(tr - sr) || 1;

  const p1x = cornerX - r * cux;
  const p1y = cornerY - r * cuy;
  const p2x = cornerX + radialDir * r * tc;
  const p2y = cornerY + radialDir * r * ts;

  return `M${sx},${sy}L${p1x},${p1y}L${p2x},${p2y}L${tx},${ty}`;
}

type GetConnectorRadialD3PathProps = {
  source: ConnectorCoords;
  target: ConnectorCoords;
  curve?: CurveFactory;
};

export function getConnectorRadialD3Path({
  source,
  target,
  curve,
}: GetConnectorRadialD3PathProps): string {
  const g = radialGeometry(source, target);
  const { sr, tr, sc, ss, tc, ts, sx, sy, tx, ty, sweepFlag } = g;

  // Step curves render as polar arcs/radials rather than cartesian stairs.
  // When source is at origin (root), degenerate to straight radial line.
  if (curve === curveStepBefore || curve === curveStepAfter || curve === curveStep) {
    if (sr < 1e-6) return `M${sx},${sy}L${tx},${ty}`;
  }
  if (curve === curveStepBefore) {
    // arc at source radius, then radial to target
    const ax = sr * tc;
    const ay = sr * ts;
    return `M${sx},${sy}A${sr},${sr},0,0,${sweepFlag},${ax},${ay}L${tx},${ty}`;
  }
  if (curve === curveStepAfter) {
    // radial at source angle to target radius, then arc at target radius
    const ax = tr * sc;
    const ay = tr * ss;
    return `M${sx},${sy}L${ax},${ay}A${tr},${tr},0,0,${sweepFlag},${tx},${ty}`;
  }
  if (curve === curveStep) {
    // radial to mid-radius, arc at mid-radius, radial to target
    const mr = (sr + tr) / 2;
    const p1x = mr * sc;
    const p1y = mr * ss;
    const p2x = mr * tc;
    const p2y = mr * ts;
    return `M${sx},${sy}L${p1x},${p1y}A${mr},${mr},0,0,${sweepFlag},${p2x},${p2y}L${tx},${ty}`;
  }

  if (curve) {
    // Other curves: apply in polar space via d3.lineRadial between the two nodes
    const gen = lineRadial().curve(curve);
    const d = gen([
      [source.x, source.y],
      [target.x, target.y],
    ]);
    return d ?? FALLBACK_PATH;
  }

  // Default: smooth radial curve via d3.linkRadial (visx LinkRadial)
  const linkGen = linkRadial<
    { source: ConnectorCoords; target: ConnectorCoords },
    ConnectorCoords
  >()
    .angle((d) => d.x)
    .radius((d) => d.y);
  return linkGen({ source, target }) ?? FALLBACK_PATH;
}
