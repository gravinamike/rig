<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Direction, Graph } from "$lib/models/constructModels"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import constants.
    import { relationshipColorByHalfAxisId, zoomBase } from "$lib/shared/constants"

    // Import stores.
    import {
        storeGraphDbModels, addGraphIdsNeedingViewerRefresh,
        relationshipBeingCreatedInfoStore, setRelationshipBeingCreatedTrackingMouse, disableRelationshipBeingCreated,
        enableRemoteRelating, disableRemoteRelating
    } from "$lib/stores"

    // Import associated widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"

    // Import API methods.
    import { createNewRelationship } from "$lib/db/clientSide/makeChanges"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide";
    


    let graph: Graph | null
    let scale: number | null
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    let direction: Direction | null
    let halfAxisId: HalfAxisId | null
    let color: string
    let opacity: number
    




    $: graph = $relationshipBeingCreatedInfoStore.graph
    $: graphWidgetStyle = $relationshipBeingCreatedInfoStore.graphWidgetStyle
    $: sourceThingId = $relationshipBeingCreatedInfoStore.sourceThingId
    $: sourceHalfAxisId = $relationshipBeingCreatedInfoStore.sourceHalfAxisId
    $: sourceDirection = $relationshipBeingCreatedInfoStore.sourceDirection
    $: sourceThingOpacity = $relationshipBeingCreatedInfoStore.sourceThingOpacity || 0
    $: destThingId = $relationshipBeingCreatedInfoStore.destThingId
    $: destHalfAxisId = $relationshipBeingCreatedInfoStore.destHalfAxisId
    $: destDirection = $relationshipBeingCreatedInfoStore.destDirection
    $: [startPositionX, startPositionY] = $relationshipBeingCreatedInfoStore.startPosition
    $: [endPositionX, endPositionY] = $relationshipBeingCreatedInfoStore.endPosition






    $: [midpointPositionX, midpointPositionY] = [(startPositionX + endPositionX) / 2, (startPositionY + endPositionY) / 2]

    $: angleInRadians = Math.atan2(endPositionY - startPositionY, endPositionX - startPositionX)
    $: angleInDegrees = angleInRadians / Math.PI * 180

    $: lineStartPositionX = startPositionX + 4 * Math.cos(angleInRadians)
    $: lineStartPositionY = startPositionY + 4 * Math.sin(angleInRadians)
    $: lineEndPositionX = endPositionX - 8 * Math.cos(angleInRadians)
    $: lineEndPositionY = endPositionY - 8 * Math.sin(angleInRadians)




    $: if (sourceThingId && sourceDirection && sourceHalfAxisId) {
        direction = sourceDirection
        halfAxisId = sourceHalfAxisId
        opacity = sourceThingOpacity
        color = relationshipColorByHalfAxisId[sourceHalfAxisId]
    } else {
        if (destThingId && destDirection && destHalfAxisId) {
            direction = destDirection
        } else {
            direction = $relationshipBeingCreatedInfoStore.selectedDirection
        }
        halfAxisId = null
        opacity = 1
        color = "grey"
    }






    $: if (sourceThingId && graphWidgetStyle) {
        scale = zoomBase ** graphWidgetStyle.zoom
        tweenedScale.set(scale)
    } else {
        tweenedScale.set(1)
    }

    $: askingForDirection = (
        !!$relationshipBeingCreatedInfoStore.destThingId
        && !direction
        && !$relationshipBeingCreatedInfoStore.trackingMouse
    )
        




    // Handling outside mouse releases.
	function handleMouseUp() {
        setRelationshipBeingCreatedTrackingMouse(false)
        if (
            sourceThingId
            && Math.hypot(endPositionX - startPositionX, endPositionY - startPositionY) > 5
        ) enableRemoteRelating(sourceThingId)
	}

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") disableRelationshipBeingCreated()
    }

    async function handlePossibleNewRelationshipSpecified(
        sourceThingId: number | null,
        destThingId: number | null,
        direction: Direction | null,
        trackingMouse: boolean
    ) {
        if (sourceThingId && destThingId && direction && !trackingMouse) {
            const newRelationshipCreated = await createNewRelationship(
                sourceThingId,
                destThingId,
                direction.id as number
            )
            if (newRelationshipCreated) {
                await storeGraphDbModels<ThingDbModel>("Thing", [sourceThingId, destThingId], true)
                await (graph as Graph).build()
                addGraphIdsNeedingViewerRefresh((graph as Graph).id)
            }
            disableRelationshipBeingCreated()
            disableRemoteRelating()
        }
    }

    $: handlePossibleNewRelationshipSpecified(
        sourceThingId,
        $relationshipBeingCreatedInfoStore.destThingId,
        direction,
        $relationshipBeingCreatedInfoStore.trackingMouse
    )
</script>


<svelte:body
    on:mouseup={handleMouseUp}
    on:keyup={handleEscape}
/>


{#if (
    $relationshipBeingCreatedInfoStore.sourceThingId
    && Math.hypot(endPositionX - startPositionX, endPositionY - startPositionY) > 5
)} <!-- For some reason this calculation needs to be done in the markup instead of the <script>, or it doesn't trigger reactivity. -->

    {#if askingForDirection}
        <div
            class="disabled-background"
            on:wheel|preventDefault
        />
    {/if}

    <svg class="relationship-being-created-widget">
        <!-- Visual image of stem. -->
        <g
            class="relationship-being-created-image"
            style="stroke: {color}; fill: {color};"
        >
            <line
                x1="{lineStartPositionX}" y1="{lineStartPositionY}"
                x2="{lineEndPositionX}" y2="{lineEndPositionY}"
                stroke-width=10
                stroke-linecap="round"
            />
            <polygon
                points="
                    {endPositionX - 5}, {endPositionY + 8}
                    {endPositionX + 5}, {endPositionY + 8}
                    {endPositionX}, {endPositionY}
                "
                style="stroke-width: 3; transform: rotate({angleInDegrees + 90}deg); transform-origin: {endPositionX}px {endPositionY}px;"
            />
        </g>
    </svg>

    <div
        class="midpoint-parts"
        style="
            position: absolute;
            left: {midpointPositionX}px; top: {midpointPositionY}px;
            transform: translate(-50%, -50%) scale({$tweenedScale});
            z-index: 1;
            opacity: {opacity};
            display: flex; flex-direction: row;
        "
    >
        {#if graphWidgetStyle && (askingForDirection || (direction && halfAxisId))}
            <div
                class="direction-widget-container"
                style="
                    border-radius: 10px;
                    {askingForDirection ? "box-shadow: 0 0 20px 10px whitesmoke;" : ""}
                "
                on:wheel|preventDefault
            >
                <DirectionDropdownWidget
                    startingDirection={direction}
                    {halfAxisId}
                    {askingForDirection}
                    {graphWidgetStyle}
                    optionClickedFunction={(_, __, option) => {direction = option; $relationshipBeingCreatedInfoStore.selectedDirection = option}}
                />
            </div>
        {/if}

        <!-- Delete button. -->
        {#if askingForDirection}
            <div
                class="delete-button-container"
                style="margin-left: -16px; margin-top: 1px; z-index: 1;"
            >
                <XButton
                    size={15}
                    buttonFunction={disableRelationshipBeingCreated}
                />
            </div>
        {/if}
    </div>
{/if}


<style>
    .disabled-background {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        z-index: 1;
        background-color: grey;
        opacity: 0.5;
    }

    .relationship-being-created-widget {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 1;

        overflow: visible;

        pointer-events: none;
    }
</style>