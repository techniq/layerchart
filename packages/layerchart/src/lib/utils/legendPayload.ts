import { Context } from 'runed';

export type LegendPayload = {
  key: string;
  label?: string;
  color?: string;
};

const _LegendPayloadContext = new Context<LegendPayload[]>('LegendContext');

export function setLegendPayloadContext(payload: LegendPayload[]) {
  return _LegendPayloadContext.set(payload);
}

export function getLegendPayloadContext() {
  return _LegendPayloadContext.getOr([] as LegendPayload[]);
}
