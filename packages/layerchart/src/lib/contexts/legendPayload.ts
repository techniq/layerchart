import { createContext } from 'svelte';

export type LegendPayload = {
  key: string;
  label?: string;
  color?: string;
};

const [_getLegendPayload, _setLegendPayload, _hasLegendPayload] = createContext<LegendPayload[]>();

export function setLegendPayloadContext(payload: LegendPayload[]) {
  return _setLegendPayload(payload);
}

export function getLegendPayloadContext() {
  return _hasLegendPayload() ? _getLegendPayload() : [];
}
