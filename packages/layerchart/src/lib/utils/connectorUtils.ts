import { type CurveFactory, line as d3Line, curveLinear } from 'd3-shape';

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
