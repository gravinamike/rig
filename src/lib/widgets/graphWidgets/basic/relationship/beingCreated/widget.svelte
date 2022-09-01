<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Direction, Thing, Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel, RelationshipCohortWidgetModel, GraphWidgetModel } from "$lib/models/widgetModels"

    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
    import { storeGraphConstructs, retrieveGraphConstructs, relationshipBeingCreatedInfoStore, setRelationshipBeingCreatedTrackingMouse, disableRelationshipBeingCreated, addGraphIdsNeedingViewerRefresh, enableRemoteRelating, disableRemoteRelating } from "$lib/stores"
    import { relationshipColorByHalfAxisId, zoomBase } from "$lib/shared/constants"
    import { XButton } from "$lib/widgets/layoutWidgets"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    import { createNewRelationship } from "$lib/db/clientSide/makeChanges"
    
    

    let direction: Direction | null
    let halfAxisId: HalfAxisId | null
    let color: string
    let opacity: number
    let graphWidgetModel: GraphWidgetModel | null
    let scale: number | null
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})


    $: sourceWidgetModel = $relationshipBeingCreatedInfoStore.sourceWidgetModel
    $: destWidgetModel = $relationshipBeingCreatedInfoStore.destWidgetModel
    $: [startPositionX, startPositionY] = $relationshipBeingCreatedInfoStore.startPosition
    $: [endPositionX, endPositionY] = $relationshipBeingCreatedInfoStore.endPosition

    $: [midpointPositionX, midpointPositionY] = [(startPositionX + endPositionX) / 2, (startPositionY + endPositionY) / 2]

    $: angleInRadians = Math.atan2(endPositionY - startPositionY, endPositionX - startPositionX)
    $: angleInDegrees = angleInRadians / Math.PI * 180

    $: lineStartPositionX = startPositionX + 4 * Math.cos(angleInRadians)
    $: lineStartPositionY = startPositionY + 4 * Math.sin(angleInRadians)
    $: lineEndPositionX = endPositionX - 8 * Math.cos(angleInRadians)
    $: lineEndPositionY = endPositionY - 8 * Math.sin(angleInRadians)


    $: if (sourceWidgetModel && sourceWidgetModel.kind === "relationshipCohortWidgetModel") {
        direction = sourceWidgetModel.direction
        halfAxisId = sourceWidgetModel.halfAxisId
        opacity = sourceWidgetModel.opacity
        color = relationshipColorByHalfAxisId[sourceWidgetModel.halfAxisId]
    } else {
        if (destWidgetModel && destWidgetModel.kind === "relationshipCohortWidgetModel") {
            direction = destWidgetModel.direction.oppositeid ? retrieveGraphConstructs("Direction", destWidgetModel.direction.oppositeid) : null
        } else {
            direction = $relationshipBeingCreatedInfoStore.selectedDirection
        }
        halfAxisId = null
        opacity = 1
        color = "grey"
    }

    $: if (sourceWidgetModel && graphWidgetModel) {
        graphWidgetModel = sourceWidgetModel.graphWidgetModel

        scale = zoomBase ** sourceWidgetModel.graphWidgetModel.style.zoom
        tweenedScale.set(scale)
    } else {
        graphWidgetModel = null

        tweenedScale.set(1)
    }

    $: askingForDirection = !direction && !$relationshipBeingCreatedInfoStore.trackingMouse
        




    // Handling outside mouse releases.
	function handleMouseUp() {
        setRelationshipBeingCreatedTrackingMouse(false)
        if (sourceWidgetModel) enableRemoteRelating(sourceWidgetModel)
	}

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") disableRelationshipBeingCreated()
    }

    async function handlePossibleNewRelationshipSpecified(
        sourceWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel | null,
        destWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel | null,
        direction: Direction | null,
        trackingMouse: boolean
    ) {
        if (sourceWidgetModel && destWidgetModel && direction && !trackingMouse) {
            const sourceThingId = sourceWidgetModel.kind === "thingWidgetModel" ?
                sourceWidgetModel.thingId as number :
                sourceWidgetModel.parentThingWidgetModel.thingId as number
            const destThingId = destWidgetModel.kind === "thingWidgetModel" ?
                destWidgetModel.thingId as number:
                destWidgetModel.parentThingWidgetModel.thingId as number

            const newRelationshipCreated = await createNewRelationship(sourceThingId, destThingId, (direction.id) as number)
            if (newRelationshipCreated) {
                await storeGraphConstructs<Thing>("Thing", [sourceThingId, destThingId], true)
                await (graphWidgetModel?.graph as Graph).build()
                addGraphIdsNeedingViewerRefresh((graphWidgetModel?.graph as Graph).id)
            }
            disableRelationshipBeingCreated()
            disableRemoteRelating()
        }
    }

    $: handlePossibleNewRelationshipSpecified(
        sourceWidgetModel,
        $relationshipBeingCreatedInfoStore.destWidgetModel,
        direction,
        $relationshipBeingCreatedInfoStore.trackingMouse
    )
</script>


<svelte:body
    on:mouseup={handleMouseUp}
    on:keyup={handleEscape}
/>


{#if (
    $relationshipBeingCreatedInfoStore.sourceWidgetModel
    && Math.hypot(endPositionX - startPositionX, endPositionY - startPositionY) > 5
)} <!-- For some reason this calculation needs to be done in the markup instead of the <script>, or it doesn't trigger reactivity. -->

    {#if askingForDirection}
        <div
            class="disabled-background"
            style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
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
            position: absolute; left: {midpointPositionX}px; top: {midpointPositionY}px;
            transform: translate(-50%, -50%) scale({$tweenedScale});
            z-index: 1;
            opacity: {opacity};
            display: flex; flex-direction: row;
        "
    >
        {#if graphWidgetModel && (askingForDirection || (direction && halfAxisId))}
            <div
                class="direction-widget-container"
                style="
                    border-radius: 10px;
                    {askingForDirection ? "box-shadow: 0 0 20px 10px whitesmoke;" : ""}
                "
                on:wheel|preventDefault
            >
                <DirectionWidget
                    {direction}
                    {halfAxisId}
                    {askingForDirection}
                    {graphWidgetModel}
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
    .relationship-being-created-widget {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 1;

        overflow: visible;

        pointer-events: none;
    }
</style>