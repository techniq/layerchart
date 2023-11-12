import { stackOffsetNone, stackOrderNone } from 'd3-shape';
type OrderType = typeof stackOrderNone;
type OffsetType = typeof stackOffsetNone;
export declare function createStackData(data: any[], options: {
    xKey: string;
    groupBy?: string;
    stackBy?: string;
    order?: OrderType;
    offset?: OffsetType;
}): any[];
/**
 * Function to offset each layer by the maximum of the previous layer
 *   - see: https://observablehq.com/@mkfreeman/separated-bar-chart
 */
export declare function stackOffsetSeparated(series: any, order: any): void;
export {};
