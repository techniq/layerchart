import { SvelteComponentTyped } from "svelte";
import type { Readable } from 'svelte/store';
export declare const tooltipContextKey: {};
export type TooltipContextValue = {
    top: number;
    left: number;
    data: any;
    show(event: MouseEvent | TouchEvent, tooltipData?: any): any;
    hide(event?: MouseEvent | TouchEvent): any;
};
export type TooltipContext = Readable<TooltipContextValue>;
export declare function tooltipContext(): TooltipContext;
declare const __propDef: {
    props: {
        mode?: "bisect-x" | "bisect-y" | "band" | "bisect-band" | "bounds" | "voronoi" | "quadtree" | "manual" | undefined;
        snapToDataX?: boolean | undefined;
        snapToDataY?: boolean | undefined;
        findTooltipData?: "closest" | "left" | "right" | undefined;
        radius?: number | undefined;
        debug?: boolean | undefined;
    };
    events: {
        click: CustomEvent<{
            data: any;
        }>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            tooltip: {
                top: number;
                left: number;
                data: null;
                show: (event: MouseEvent | TouchEvent, tooltipData?: any) => void;
                hide: () => void;
            };
        };
    };
};
export type TooltipContextProps = typeof __propDef.props;
export type TooltipContextEvents = typeof __propDef.events;
export type TooltipContextSlots = typeof __propDef.slots;
export default class TooltipContext extends SvelteComponentTyped<TooltipContextProps, TooltipContextEvents, TooltipContextSlots> {
}
export {};
