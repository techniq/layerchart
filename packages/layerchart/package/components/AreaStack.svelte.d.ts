import { SvelteComponentTyped } from "svelte";
import type { CurveFactory } from 'd3-shape';
declare const __propDef: {
    props: {
        curve?: CurveFactory | undefined;
        defined?: ((d: any, index: number, data: any[]) => boolean) | undefined;
        opacity?: number | undefined;
        line?: boolean | any;
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type AreaStackProps = typeof __propDef.props;
export type AreaStackEvents = typeof __propDef.events;
export type AreaStackSlots = typeof __propDef.slots;
export default class AreaStack extends SvelteComponentTyped<AreaStackProps, AreaStackEvents, AreaStackSlots> {
}
export {};
