declare module 'd3-regression' {
  type Accessor<T> = (d: T) => number;

  interface RegressionBase<T> {
    (data: T[]): [number, number][];
    x(): Accessor<T>;
    x(fn: Accessor<T>): this;
    y(): Accessor<T>;
    y(fn: Accessor<T>): this;
    domain(): [number, number] | undefined;
    domain(d: [number, number]): this;
  }

  interface LoessRegression<T> {
    (data: T[]): [number, number][];
    x(): Accessor<T>;
    x(fn: Accessor<T>): this;
    y(): Accessor<T>;
    y(fn: Accessor<T>): this;
    bandwidth(): number;
    bandwidth(b: number): this;
  }

  interface PolyRegression<T> extends RegressionBase<T> {
    order(): number;
    order(n: number): this;
  }

  export function regressionLinear<T = [number, number]>(): RegressionBase<T>;
  export function regressionQuad<T = [number, number]>(): RegressionBase<T>;
  export function regressionPoly<T = [number, number]>(): PolyRegression<T>;
  export function regressionExp<T = [number, number]>(): RegressionBase<T>;
  export function regressionLog<T = [number, number]>(): RegressionBase<T>;
  export function regressionPow<T = [number, number]>(): RegressionBase<T>;
  export function regressionLoess<T = [number, number]>(): LoessRegression<T>;
}
