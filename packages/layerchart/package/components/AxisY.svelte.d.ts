import { SvelteComponentTyped } from "svelte";
import type { FormatType } from 'svelte-ux/utils/format';
declare const __propDef: {
    props: {
        gridlines?: boolean | svelte.JSX.SVGProps<SVGLineElement>;
        ticks?: number | Function | undefined;
        formatTick?: FormatType;
        xTick?: number | undefined;
        yTick?: number | undefined;
        dxTick?: number | undefined;
        dyTick?: number | undefined;
        labelProps?: {
            [x: string]: any;
            value?: string | number | undefined;
            width?: number | undefined;
            x?: string | number | undefined;
            y?: string | number | undefined;
            dx?: string | number | undefined;
            dy?: string | number | undefined;
            lineHeight?: string | undefined;
            capHeight?: string | undefined;
            scaleToFit?: boolean | undefined;
            textAnchor?: "start" | "middle" | "end" | "inherit" | undefined;
            verticalAnchor?: "start" | "middle" | "end" | "inherit" | undefined;
            rotate?: number | undefined;
        } | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type AxisYProps = typeof __propDef.props;
export type AxisYEvents = typeof __propDef.events;
export type AxisYSlots = typeof __propDef.slots;
export default class AxisY extends SvelteComponentTyped<AxisYProps, AxisYEvents, AxisYSlots> {
}
export {};
