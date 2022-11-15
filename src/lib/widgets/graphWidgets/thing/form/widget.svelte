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
    export let perspectiveTexts: {[thingId: string]: string}
    export let cohortMembersToDisplay: GenerationMember[]


    // Attributes handled by widget controller.
    let baseText: string
    let perspectiveText: string
    let encapsulatingDepth: number
    let thingWidth: number
    let thingHeight: number
    let distanceFromFocalPlane: number
    let usePerspectiveText: boolean
    let submit: () => void
    let cancel: () => void

    


</script>


<!-- Widget controller. -->
<ThingFormWidgetController
    {thing}
    {graph}
    {graphWidgetStyle}
    {perspectiveTexts}
    {cohortMembersToDisplay}

    bind:baseText
    bind:perspectiveText
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
        id={"thing-form-text-field"}
        bind:text={baseText}
        bind:perspectiveText
        {usePerspectiveText}
        {submit}
        {cancel}
    />
</div>


<style>
    .thing-form-widget {
        outline: dotted 2px lightgrey;
        outline-offset: -1px;

        position: relative;
        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }
</style>