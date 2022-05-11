<script lang="ts">
    // Type imports.
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { Graph, Cohort } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { planePadding } from "$lib/shared/constants"
    import { XButton } from "$lib/widgets/layoutWidgets"

    import { createNewRelatedThing } from "$lib/db/clientSide"
    import { storeGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph


    let textField: HTMLTextAreaElement

    // Variables situating the Thing in its spatial context (Half-Axis, Plane)
    $: halfAxisId = thingWidgetModel.parentCohort.address.halfAxisId || 0
    $: planeId = [7, 8].includes(halfAxisId) ?
        thingWidgetModel.parentCohort.address.parentThingWidgetModel?.parentCohort.plane?.id || 0 :
        thingWidgetModel.parentCohort.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    
    // Variables dealing with encapsulation (Things containing other Things).
    $: encapsulatingDepth = thingWidgetModel.parentCohort.encapsulatingDepth || 0
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: elongation = thingWidgetModel.parentCohort.axialElongation
    $: elongationCategory = (
        [1, 2, 3, 4].includes(halfAxisId) ?
        ( [1, 2].includes(halfAxisId) ? "vertical" : "horizontal" ) :
        "neutral"
    ) as ("vertical" | "horizontal" | "neutral")
    let XYElongation: {x: number, y: number}
    $: switch (elongationCategory) {
        case "vertical": 
            XYElongation = {x: 1, y: elongation}; break
        case "horizontal":
            XYElongation = {x: elongation, y: 1}; break
        case "neutral":
            XYElongation = {x: elongation, y: elongation}; break
    }

    // Variables dealing with Thing sizing.
    $: cohortSize = thingWidgetModel.parentCohort.members.length || 1
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * XYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * XYElongation.y : thingSize * XYElongation.y / cohortSize - 2
    

    async function submit() {
        const parentThingId = ((thingWidgetModel.parentThingWidgetModel as ThingWidgetModel).thingId as number)
        const space = (thingWidgetModel.parentCohort.address.parentThingWidgetModel as ThingWidgetModel).space
        const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
        const text = textField.value

        const newRelatedThingCreated = await createNewRelatedThing(parentThingId, directionId, text)
        if (newRelatedThingCreated) {
            await storeGraphConstructs<ThingDbModel>("Thing", parentThingId, true)
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }

    async function cancel() {
        (thingWidgetModel.parentCohort as Cohort).removeMember(thingWidgetModel)
        graph.formActive = false
        addGraphIdsNeedingViewerRefresh(graph.id)
    }    
</script>


<!-- Thing Widget. -->
<div
    class="box thing-outline-form-widget"
    style="
        border-radius: {10 + 4 * encapsulatingDepth}px;
        width: {thingWidth}px; height: {thingHeight}px;
        pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};
    "
    on:keypress={(event) => {if (event.key === "Enter") submit()}}
>    
    <div class="cancel-button-container">
        <XButton
            buttonFunction={cancel}
        />
    </div>

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
        outline: dotted 2px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-outline-form-widget {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        gap: 1rem;
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