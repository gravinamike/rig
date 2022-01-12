<script lang="ts">
    // Type imports.
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Cohort } from "$lib/shared/graph/cohort"
    import type { ThingWidgetModel } from "$lib/shared/graph/widgetModels/thingWidgetModel"

    // Graph widget imports.
    import { planePadding } from "$lib/shared/constants"
    import XButton from "$lib/components/layoutElements/xButton.svelte"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph


    let textField: HTMLTextAreaElement

    // Variables situating the Thing in its spatial context (Half-Axis, Plane)
    $: halfAxisId = thingWidgetModel.parentCohort?.address?.halfAxisId || 0
    $: planeId = [7, 8].includes(halfAxisId) ?
        thingWidgetModel.parentCohort?.address?.parentThingWidgetModel?.parentCohort?.plane?.id || 0 :
        thingWidgetModel.parentCohort?.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    
    // Variables dealing with encapsulation (Things containing other Things).
    $: encapsulatingDepth = thingWidgetModel.parentCohort?.encapsulatingDepth || 0
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    // Variables dealing with Thing sizing.
    $: cohortSize = thingWidgetModel.parentCohort?.members.length || 1
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize : thingSize / cohortSize - 2

    async function submit() {
        const parentThingId = ((thingWidgetModel.parentThingWidgetModel as ThingWidgetModel).thingId as number)
        const space = (thingWidgetModel.parentCohort?.address?.parentThingWidgetModel as ThingWidgetModel).space
        const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
        const text = textField.value

        await graph.createNewRelatedThing(parentThingId, directionId, text)////////////// Add text and Direction to this.
        graph = graph // Needed for reactivity.
    }

    async function cancel() {
        (thingWidgetModel.parentCohort as Cohort).removeMember(thingWidgetModel)
        graph.formActive = false
        graph = graph // Needed for reactivity.
    }    
</script>


<!-- Thing Widget. -->
<div
    class="box thing-form-widget"
    style="border-radius: {8 + 4 * encapsulatingDepth}px; width: {thingWidth}px; height: {thingHeight}px; pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};"
    on:keypress={(event) => {if (event.key === "Enter") submit()}}
>    
    <XButton
        buttonFunction={cancel}
    />

    <!-- Thing text -->
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
    .box {
        box-shadow: 5px 5px 10px 2px lightgray;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-form-widget {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        gap: 1rem;
    }

    textarea {
        width: 100% !important;

        font-family: Arial;
        font-size: 10px;   

        resize: none;
    }
</style>