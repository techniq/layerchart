import type { ColorProp, DataProp } from 'layerchart';

export type LineProps = {
  /** Rows to draw a line each for (else the chart's, when an end reads them) */
  data?: any[];
  /** Where it starts across: a number of pixels, or a data key / function through the `x` scale */
  x1: DataProp;
  /** Where it starts down: a number of pixels, or a data key / function through the `y` scale */
  y1: DataProp;
  /** Where it ends across, as `x1` */
  x2: DataProp;
  /** Where it ends down, as `y1` */
  y2: DataProp;
  /** Its start's height off the floor: pixels, or a data key / function through the `z` scale */
  z1?: DataProp;
  /** Its end's height off the floor, as `z1` */
  z2?: DataProp;
  /**
   * A CSS color, or a data key / function run through the chart's color scale.
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: ColorProp;
  /** @default 1 */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-primary`): the stroke,
   * stroke width, and opacity they set, where its props don't say
   */
  class?: string;
};
