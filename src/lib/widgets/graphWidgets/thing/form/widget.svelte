<script lang="ts">
    // Import types.
    import type { GenerationMember, Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import ThingFormWidgetController from "./controller.svelte"

    // Import related widgets.
    import { ThingTextFormWidget } from "../subWidgets"
    

    /**
     * @param thing - The Thing that the widget is based on.
     * @param graph - The Graph that the Thing is part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     */
    export let thing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let cohortMembersToDisplay: GenerationMember[]


    // Attributes handled by widget controller.
    let textField: HTMLTextAreaElement | null = null
    let encapsulatingDepth: number
    let thingWidth: number
    let thingHeight: number
    let distanceFromFocalPlane: number
    let submit: () => {}
    let cancel: () => {}
</script>


<!-- Widget controller. -->
<ThingFormWidgetController
    {thing}
    {graph}
    {graphWidgetStyle}
    {textField}
    {cohortMembersToDisplay}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:distanceFromFocalPlane
    bind:submit
    bind:cancel
/>


<!-- Thing Widget. -->
<div
    class="thing-form-widget"
    style="
        border-radius: {10 + 4 * encapsulatingDepth}px;
        width: {thingWidth}px; height: {thingHeight}px;
        pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};
    "
>
    <ThingTextFormWidget
        bind:textField
        {submit}
        {cancel}
    />
</div>


<style>
    .thing-form-widget {
        outline: dotted 2px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        gap: 1rem;

        cursor: default;
    }
</style>