import { SvelteComponentTyped } from "svelte";
import { Svg as _Svg, Html as _Html } from 'layercake';
export declare const Svg: typeof _Svg;
export declare const Html: typeof _Html;
import type { ComponentProps } from 'svelte';
import TooltipContext from './TooltipContext.svelte';
declare const __propDef: {
    props: {
        [x: string]: any;
        data?: any[] | undefined;
        x?: (string | ((d: any) => number)) | (string | ((d: any) => number))[] | undefined;
        y?: (string | ((d: any) => number)) | (string | ((d: any) => number))[] | undefined;
        yScale?: Function | undefined;
        xBaseline?: number | null | undefined;
        yBaseline?: number | null | undefined;
        tooltip?: ComponentProps<TooltipContext> | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            aspectRatio: number;
            containerHeight: number;
            containerWidth: number;
            height: number;
            width: number;
            element: Element;
        };
    };
};
export type ChartProps = typeof __propDef.props;
export type ChartEvents = typeof __propDef.events;
export type ChartSlots = typeof __propDef.slots;
export default class Chart extends SvelteComponentTyped<ChartProps, ChartEvents, ChartSlots> {
}
export {};
