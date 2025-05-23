import * as d3 from 'd3-shape';

declare module 'd3-shape' {
  interface Arc<This, Datum> {
    (): string | null;
  }
}
