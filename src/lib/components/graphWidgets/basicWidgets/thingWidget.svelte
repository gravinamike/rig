<script lang="ts">
    // Type imports.
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Thing } from "$lib/shared/graph/dbConstructs"
    import type { ThingWidgetModel } from "$lib/shared/graph/graphWidgets"

    // Graph widget imports.
    import { hoveredThingIdStore, addPin } from "$lib/shared/stores/appStores"
    import { storeGraphConstructs, retrieveGraphConstructs } from "$lib/shared/stores/graphStores"
    import ThingDetailsWidget from "$lib/components/graphWidgets/detailsWidgets/thingDetailsWidget.svelte"
    import { planePadding } from "$lib/shared/constants"
    import { ContextMenuFrame, ContextMenuOption } from "$lib/components/layoutElements/contextMenu"
import { sleep } from "$lib/shared/utility";

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>

    
    let contextMenu: ContextMenuFrame

    // IDs of the Thing's model and widget.
    $: thingId = thingWidgetModel.thingId
    $: thingWidgetId = thingWidgetModel.thingWidgetId

    $: text = thingWidgetModel.text

    // Variables situating the Thing in its spatial context (Half-Axis, Plane)
    $: halfAxisId = thingWidgetModel.parentCohort?.address?.halfAxisId || 0
    $: planeId = [7, 8].includes(halfAxisId) ?
        thingWidgetModel.parentCohort?.address?.parentThingWidgetModel?.parentCohort?.plane?.id || 0 :
        thingWidgetModel.parentCohort?.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    
    // Variables dealing with encapsulation (Things containing other Things).
    $: isEncapsulating = halfAxisId === 8 || 7 in thingWidgetModel.childCohortsByHalfAxisId ?
        true :
        false
    $: encapsulatingDepth = thingWidgetModel.parentCohort?.encapsulatingDepth || 0
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    // Variables dealing with Thing sizing.
    $: cohortSize = thingWidgetModel.parentCohort?.members.length || 1
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize : thingSize / cohortSize - 2
    
    // Variables dealing with visual formatting (color, opacity, outline, etc.).
    $: opacity = [7, 8].includes(halfAxisId) ?
        1 :
        1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    $: isHoveredThing = thingId === hoveredThingIdStoreValue

    let showDetails = false
    let lockDetails = false



    async function createNewRelatedThing() {

        let res: Response

        res = await fetch(`api/createNewRelatedThingFromThingId-${thingId}`)

        // If the response is ok,
        if (res.ok) {
            await storeGraphConstructs<Thing>("Thing", thingId, true)
            await graph.build()
            graph = graph

        // Handle errors if needed.
        } else {
            res.text().then(text => {throw Error(text)})
        }

    }

</script>


<!-- Thing Widget. -->
<div
    id="{thingWidgetId}"
    class="box thing-widget { isHoveredThing ? "hovered-thing" : "" }"
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    on:click={ () => { rePerspectToThingId(thingId) } }
    on:contextmenu|preventDefault={contextMenu.openContextMenu}
    style="border-radius: {8 + 4 * encapsulatingDepth}px; width: {thingWidth}px; height: {thingHeight}px; opacity: {opacity}; pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};"
>
    <!-- Thing text -->
    <div class="thing-text"
        style="
            {
                isEncapsulating ?
                "position: absolute; transform: translate(0%, -50%); white-space: nowrap;" :
                "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); overflow-wrap: break-word;"
            }
            
            font-size: {
                encapsulatingDepth >= 0 ?
                graph.graphWidgetStyle.thingTextSize :
                graph.graphWidgetStyle.thingTextSize / Math.log2(cohortSize)
            }px;
            font-weight: 600;
        "
    >
        {text}
    </div>
    
    {#if ( showDetails || lockDetails ) && thingWidgetModel.thing}
        <div class="thing-details-container" style="top: {thingHeight - 18}px; left: {thingWidth - 18}px;">
            <ThingDetailsWidget
                thing={thingWidgetModel.thing}
            />
        </div>
    {/if}
    <div
        class="toggle-button {showDetails || lockDetails ? "pressed" : ""}"
        on:click|stopPropagation={()=>{lockDetails = !lockDetails}}
        on:mouseenter={()=>{showDetails = true}}
        on:mouseleave={()=>{showDetails = false}}
        >
    </div>

    <ContextMenuFrame bind:this={contextMenu}>
        <ContextMenuOption
            text="Add Thing to Pins"
            on:click={() => {addPin(thingId)}}
        />

        <ContextMenuOption
            text="Create new related Thing"
            on:click={createNewRelatedThing}
        />
    </ContextMenuFrame>
</div>


<style>
    .box {
        box-shadow: 5px 5px 10px 2px lightgray;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-widget {
        position: relative;
    }

    .thing-widget:hover {
        box-shadow: 5px 5px 10px 10px lightgray;

        z-index: 1;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .thing-details-container {
        position: absolute;
    }

    .toggle-button {
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        position: absolute;
        bottom: 1px;
        right: 1px;
        height: 16px;
        width: 16px;

        text-align: center;
        font-size: 0.5rem;
        color: lightgrey;
        
        cursor: pointer;
    }

    .toggle-button.pressed {
        background-color: gainsboro;
    }
</style>