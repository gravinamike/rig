<script lang="ts">
    // Import types.
    import type { GenerationMember, Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import ThingFormWidgetController from "./controller.svelte"

    // Import related widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"
    

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
    let textField: HTMLTextAreaElement
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
    
    on:keypress={(event) => {
        if (event.key === "Enter") submit()
    }}
>
    <!-- Cancel button. -->
    <div class="cancel-button-container">
        <XButton
            buttonFunction={cancel}
        />
    </div>

    <!-- Thing text field. -->
    <textarea
        id="thing-form-text-field"
        bind:this={textField}
        
        class="text-input"
        rows=3
        placeholder="Enter text"

        on:mousemove|stopPropagation
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

    .cancel-button-container {
        position: absolute;
        top: 2px;
        right: 2px;
    }

    textarea {
        outline: none;
        border: solid 1px lightgrey;

        width: 100% !important;

        font-family: Arial;
        font-size: 10px;   

        resize: none;
    }

    textarea:focus {
        border: solid 1px grey;
    }
</style>