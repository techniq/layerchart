import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        topOffset?: number | undefined;
        leftOffset?: number | undefined;
        contained?: false | "container" | undefined;
        animate?: boolean | undefined;
        header?: ((data: any) => any) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        header: {};
        default: {
            data: any;
        };
    };
};
export type TooltipProps = typeof __propDef.props;
export type TooltipEvents = typeof __propDef.events;
export type TooltipSlots = typeof __propDef.slots;
export default class Tooltip extends SvelteComponentTyped<TooltipProps, TooltipEvents, TooltipSlots> {
}
export {};
