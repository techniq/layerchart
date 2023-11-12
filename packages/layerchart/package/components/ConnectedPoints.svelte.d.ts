import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        offsetX?: (number | ((value: number, context: any) => number)) | undefined;
        offsetY?: (number | ((value: number, context: any) => number)) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ConnectedPointsProps = typeof __propDef.props;
export type ConnectedPointsEvents = typeof __propDef.events;
export type ConnectedPointsSlots = typeof __propDef.slots;
export default class ConnectedPoints extends SvelteComponentTyped<ConnectedPointsProps, ConnectedPointsEvents, ConnectedPointsSlots> {
}
export {};
