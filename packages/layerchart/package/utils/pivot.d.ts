export declare function getAccessor(key: any): any;
/**
 * Pivot longer (columns to rows)
 *  - see: https://observablehq.com/d/3ea8d446f5ba96fe
 *  - see also: https://observablehq.com/d/ac2a320cf2b0adc4 as generator
 */
export declare function pivotLonger(data: any, columns: any, name: any, value: any): any;
/**
 * Pivot wider (rows to columns)
 *  - see: https://github.com/d3/d3-array/issues/142#issuecomment-761861983
 */
export declare function pivotWider(data: any, column: any, name: any, value: any): any[];
export declare function first(items: any): any;
export declare function last(items: any): any;
