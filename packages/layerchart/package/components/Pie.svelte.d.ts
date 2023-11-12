import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
import type { TooltipContextValue } from './TooltipContext.svelte';
declare const __propDef: {
    props: {
        data?: any;
        /**
             * Range [min,max] in degrees.  See also startAngle/endAngle
             */ range?: number[] | undefined;
        /**
             * Start angle in radians
             */ startAngle?: number | undefined;
        /**
             * End angle in radians
             */ endAngle?: number | undefined;
        /**
             * Define innerRadius.
             *   value >= 1: discrete value
             *   value >  0: percent of `outerRadius`
             *   value <  0: offset of `outerRadius`
             *   default: yRange min
             */ innerRadius?: undefined;
        /**
             * Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2)
             */ outerRadius?: undefined;
        cornerRadius?: number | undefined;
        padAngle?: number | undefined;
        color?: string | ((obj: {
            value: any;
            item: any;
            index: number;
        }) => string) | undefined;
        spring?: boolean | Parameters<typeof springStore>[1];
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
        /**
             * Offset all arcs from center
             */ offset?: number | undefined;
        /**
             * Tooltip context to setup mouse events to show tooltip for related data
             */ tooltip?: TooltipContextValue | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            arcs: import("d3-shape").PieArcDatum<number | {
                valueOf(): number;
            }>[];
        };
    };
};
export type PieProps = typeof __propDef.props;
export type PieEvents = typeof __propDef.events;
export type PieSlots = typeof __propDef.slots;
export default class Pie extends SvelteComponentTyped<PieProps, PieEvents, PieSlots> {
}
export {};
