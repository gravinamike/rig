<script lang="ts">
    // Type imports.
    import type { Graph, Space, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Graph widget imports.
    import { planePadding } from "$lib/shared/constants"
    import { XButton } from "$lib/widgets/layoutWidgets"

    import { thingSearchListItems, createNewRelatedThing } from "$lib/db/clientSide"
    import { storeGraphDbModels, addGraphIdsNeedingViewerRefresh, updateThingSearchListStore } from "$lib/stores"
    import type { ThingDbModel } from "$lib/models/dbModels";


    export let thing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    let textField: HTMLTextAreaElement

    // Variables situating the Thing in its spatial context (Half-Axis, Plane)
    $: halfAxisId = thing?.parentCohort.halfAxisId || 0
    $: planeId = [7, 8].includes(halfAxisId) ?
        thing?.parentCohort.parentThing?.parentCohort.plane?.id || 0 :
        thing?.parentCohort.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.planes.focalPlaneId
    
    // Variables dealing with encapsulation (Things containing other Things).
    $: encapsulatingDepth = thing?.parentCohort.encapsulatingDepth || 0
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: elongation = thing?.parentCohort.axialElongation || 1
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
    $: cohortSize = thing?.parentCohort.members.length || 1
    $: thingSize = graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * XYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * XYElongation.y : thingSize * XYElongation.y / cohortSize - 2
    

    async function submit() {
        const parentThingId = (thing.parentThing?.id as number)
        const space = (thing.parentCohort.parentThing as Thing).space as Space
        const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
        const text = textField.value

        const newRelatedThing = await createNewRelatedThing(parentThingId, directionId, text)
        if (newRelatedThing && newRelatedThing.id) {
            await storeGraphDbModels<ThingDbModel>("Thing", parentThingId, true)
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)

            const queriedThingSearchListItems = await thingSearchListItems([newRelatedThing.id])
            if (queriedThingSearchListItems) updateThingSearchListStore(queriedThingSearchListItems)
        }
    }

    async function cancel() {
        thing.parentCohort.removeMemberById(thing.id)
        graph.formActive = false
        addGraphIdsNeedingViewerRefresh(graph.id)
    }    
</script>


<!-- Thing Widget. -->
<div
    class="box thing-form-widget"
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

    .thing-form-widget {
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