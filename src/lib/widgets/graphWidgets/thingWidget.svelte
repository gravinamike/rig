<script lang="ts">
    // Type imports.
    import type { Thing } from "$lib/models/dbModels"
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { hoveredThingIdStore, addPin } from "$lib/stores"
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import { planePadding } from "$lib/shared/constants"
    import { XButton } from "$lib/widgets/layoutWidgets"
    import { ContextMenuFrame, ContextMenuOption } from "$lib/widgets/layoutWidgets"

    import { storeGraphConstructs, unstoreGraphConstructs, retrieveGraphConstructs } from "$lib/stores"
    import { deleteThing } from "$lib/db/clientSide/makeChanges"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>

    
    let contextMenu: ContextMenuFrame

    // IDs of the Thing's model and widget.
    $: thingId = thingWidgetModel.thingId as number
    $: thingWidgetId = thingWidgetModel.thingWidgetId as string

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
    $: elongation = thingWidgetModel.parentCohort?.axialElongation || 1
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

    $: cohortSize = thingWidgetModel.parentCohort?.members.length || 1
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * XYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * XYElongation.y : thingSize * XYElongation.y / cohortSize - 2
    
    // Variables dealing with visual formatting (color, opacity, outline, etc.).
    $: opacity = [7, 8].includes(halfAxisId) ?
        1 :
        1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    $: isHoveredThing = thingId === hoveredThingIdStoreValue
    let isHoveredWidget = false

    let confirmDeleteBoxOpen = false
    let showDetails = false
    let lockDetails = false

    async function startDelete() {
        confirmDeleteBoxOpen = true
    }

    async function confirmDelete() {
        // Get the to-be-deleted Thing from the Store.
        const deletedThing = retrieveGraphConstructs<Thing>("Thing", thingId)
        if (deletedThing) {

            const thingDeleted = await deleteThing(thingId)
            if (thingDeleted) {
                // Get IDs of Stored Things related to the deleted Thing, and re-store them.
                const relatedThingIds = deletedThing.relatedThingIds.filter(id => !(id === null)) as number[]

                // Re-store any Things that were related to the deleted Thing (updating
                // their relations in the process).
                await storeGraphConstructs<Thing>("Thing", relatedThingIds, true)

                // Remove the deleted Thing itself from the Store.
                await unstoreGraphConstructs("Thing", relatedThingIds)

                await graph.build()
                graph = graph // Needed for reactivity.
            }

        }
    }

    const showContent = true
</script>


<!-- Thing Widget. -->
<div
    id="{thingWidgetId}"
    class="box thing-widget { isHoveredThing ? "hovered-thing" : "" }"
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId); isHoveredWidget = true}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null); isHoveredWidget = false; confirmDeleteBoxOpen = false}}
    on:click={ () => { rePerspectToThingId(thingId) } }
    on:contextmenu|preventDefault={contextMenu.openContextMenu}
    style="border-radius: {8 + 4 * encapsulatingDepth}px; width: {thingWidth}px; height: {thingHeight}px; opacity: {opacity}; pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};"
>
    {#if isHoveredWidget && !confirmDeleteBoxOpen}
        <div class="delete-button-container">
            <XButton
                buttonFunction={startDelete}
            />
        </div>
    {/if}

    <!-- Thing text -->
    <div style="width: {Math.min(thingWidth, thingHeight)}px; height: {Math.min(thingWidth, thingHeight)}px; left: 0; text-align: center; {showContent && elongationCategory === "horizontal" ? "transform: rotate(-90deg);" : ""}">
        <div
            class="thing-text"
            style="
                {
                    isEncapsulating ?
                    "position: absolute; transform: translate(0%, -50%); white-space: nowrap;" :
                    (
                        showContent ?
                        `text-align: center;` :
                        "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); overflow-wrap: break-word;"
                    )
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
    </div>

    {#if showContent}
        <div
            class="content-box"
            style={
                elongationCategory === "horizontal" ? 
                "border-radius: 0 4px 4px 0; width: calc(100% - 50px); height: calc(100% - 10px); top: 5px; right: 5px;" :
                "border-radius: 0 0 4px 4px; width: calc(100% - 10px); height: calc(100% - 50px); bottom: 5px; left: 5px;"
            }
        >
        </div>
    {/if}

    {#if confirmDeleteBoxOpen}
        <div
            class="confirm-delete-container"
            style="border-radius: {8 + 4 * encapsulatingDepth}px;"
        >
            <div class="confirm-delete-blur" />
            <div
                class="confirm-delete-box"
                style="width: {thingWidth}px; height: {thingHeight * 0.3}px; font-size: {thingHeight * 0.15}px;"
            >
                <div>
                    DELETE?
                </div>
                <div>
                    <XButton
                        buttonFunction={confirmDelete}
                        size={20}
                        square={true}
                        caution={true}
                    />
                </div>
            </div>
        </div>
    {/if}
    
    {#if ( showDetails || lockDetails ) && thingWidgetModel.thing}
        <div class="thing-details-container" style="top: {thingHeight - 20}px; left: {thingWidth - 20}px;">
            <ThingDetailsWidget
                thing={thingWidgetModel.thing}
            />
        </div>
    {/if}

    {#if !confirmDeleteBoxOpen}
        <div
            class="toggle-button {showDetails || lockDetails ? "pressed" : ""}"
            on:click|stopPropagation={()=>{lockDetails = !lockDetails}}
            on:mouseenter={()=>{showDetails = true}}
            on:mouseleave={()=>{showDetails = false}}
            >
        </div>
    {/if}

    <ContextMenuFrame bind:this={contextMenu}>
        <ContextMenuOption
            text="Add Thing to Pins"
            on:click={() => {addPin(thingId)}}
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
        outline-offset: -2px;
    }



    .content-box {
        outline: inset 1px lightgrey;
        outline-offset: -1px;

        position: absolute;
        background-color: white;
    }



    .delete-button-container {
        position: absolute;
        top: 2px;
        right: 2px;
        z-index: 1;
    }

    .confirm-delete-container {
        position: absolute;
        width: 100%;
        height: 100%;

        overflow: hidden;
    }

    .confirm-delete-blur {
        width: 100%;
        height: 100%;
        background-color: gainsboro;
        opacity: 0.75;
    }

    .confirm-delete-box {
        border-top: solid 2px black;

        position: absolute;
        bottom: 0;
        background-color: white;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;

        font-weight: 600;
    }

    .toggle-button {
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        position: absolute;
        bottom: 2px;
        right: 2px;
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

    .thing-details-container {
        position: absolute;
    }
</style>