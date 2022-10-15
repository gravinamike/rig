<script context="module" lang="ts">
    import type { Direction, Thing, GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"
    import {
        hoveredThingIdStore, storeGraphDbModels, addGraphIdsNeedingViewerRefresh,
        relationshipBeingCreatedInfoStore,
        reorderingInfoStore, enableReordering,
        setReorderingDragStart
    } from "$lib/stores"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    import { updateRelationships } from "$lib/db/clientSide"
</script>

<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "../../graph"
    import type { ThingDbModel } from "$lib/models/dbModels"


    export let graph: Graph
    export let cohort: ThingCohort
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let relationshipColor: string
    export let mirroring: -1 |1
    export let rotation: number
    export let direction: Direction | null = null
    export let halfAxisId: HalfAxisId
    export let graphWidgetStyle: GraphWidgetStyle
    export let relatableForCurrentDrag: boolean

    $: thing = cohortMemberWithIndex.member.thing as Thing
    let leafHovered = false
    $: thingHovered = thing.id === $hoveredThingIdStore
    $: relationshipHovered = thing.id && thing.id === thingIdOfHoveredRelationship
    let leafClicked = false

    $: showDirection =
        (
            !($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag)
            && (leafHovered || relationshipHovered)
        ) ? true :
        false

    async function changeRelationshipDirection(directionId: number) {
        const sourceThingId = thing.parentThing?.id || null
        const destThingId = thing.id || null

        if (sourceThingId && destThingId && directionId) {
            const relationshipsUpdated = await updateRelationships([
                {
                    sourceThingId: sourceThingId,
                    destThingId: destThingId,
                    directionId: directionId
                }
            ])
            if (relationshipsUpdated) {
                await storeGraphDbModels<ThingDbModel>("Thing", sourceThingId, true)
                await graph.build()
                addGraphIdsNeedingViewerRefresh(graph.id)
            }

        }
    }





    





    


    /**
     * Handle-mouse-down method.
     * 
     * Handles tasks that should be executed when the mouse button is pressed
     * down on the Leaf (including recording the start od a drag).
     * @param event - The MouseEvent that triggered this method.
     */
    function handleMouseDown(event: MouseEvent) {
        // Record the start of a drag operation to the Relationship-reordering
        // store.
        setReorderingDragStart(
            [event.clientX, event.clientY] as [number, number],
            graphWidgetStyle,
            cohort,
            cohortMemberWithIndex.member.thingId as number)
    }

    /**
     * Handle-body-mouse-move method.
     * 
     * Handles tasks that should be executed when the mouse is moved over the
     * page body (including Relationship-reordering drags).
     * @param event - The MouseEvent that triggered this method.
     */
    function handleBodyMouseMove(event: MouseEvent) {
        const dragChangeX =
            $reorderingInfoStore.dragStartPosition ? event.clientX - $reorderingInfoStore.dragStartPosition[0] :
            null
        const dragChangeY =
            $reorderingInfoStore.dragStartPosition ? event.clientY - $reorderingInfoStore.dragStartPosition[1] :
            null
        
        // If...
        if (
            // ...there is a drag being tracked for this Relationship...
            $reorderingInfoStore.thingCohort === cohort
            && $reorderingInfoStore.destThingId === cohortMemberWithIndex.member.thingId
            // ...the drag has proceeded a certain distance...
            && dragChangeX && dragChangeY
            && Math.hypot(dragChangeX, dragChangeY) > 5
            // ...and there's not yet a reordering operation taking place...
            && !$reorderingInfoStore.reorderInProgress
        ) {
            enableReordering(
                $reorderingInfoStore.dragStartPosition as [number, number],
                graphWidgetStyle,
                cohort,
                cohortMemberWithIndex.index,
                cohortMemberWithIndex.member.thingId as number
            )
        }
    }


    /**
     * Handle-body-mouse-up method.
     * 
     * Handles tasks that should be executed when the mouse button is released
     * over the page body (including disabling the leaf-clicked flag).
     * @param event - The MouseEvent that triggered this method.
     */
    function handleBodyMouseUp(event: MouseEvent) {
        leafClicked = false
    }
    

</script>





<svelte:body lang="ts"
    on:mousemove={handleBodyMouseMove}
    on:mouseup={handleBodyMouseUp}
/>







<!-- Relationship leaf. -->
<div
    class="relationship-leaf"
    on:mouseenter={()=>{thingIdOfHoveredRelationship = thing.id || null}}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>
    <svg
        style="
            height: 100%; width: 100%;
            stroke: {relationshipColor};
            fill: {relationshipColor};
        "
    >

    <!-- Hoverable zone of leaf. -->
    <line
        class="leaf-hover-zone"

        x1="{leafGeometry.bottomMidline}" y1="{leafGeometry.bottom}"
        x2="{leafGeometry.topMidline}" y2="{leafGeometry.top}"
        
        style="stroke-width: {8 / tweenedScale};"

        on:mouseenter={()=>{leafHovered = true}}
        on:mouseleave={()=>{leafHovered = false}}
        on:mousedown={ (event) => {
            leafClicked = true
            if (event.button === 0) handleMouseDown(event)
        }}
        on:mouseup={()=>{leafClicked = false}}
    />

    <!-- Visual image of leaf. -->
    <line
        class="
            leaf-image
            {!($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag) && (leafHovered || relationshipHovered || thingHovered) ? "hovered" : ""}
            {leafClicked ? "clicked" : ""}
        "
        style="stroke-width: {3 / tweenedScale};"
        x1="{leafGeometry.bottomMidline}" y1="{leafGeometry.bottom}"
        x2="{leafGeometry.topMidline}" y2="{leafGeometry.top}"
    />

    </svg>

    <!-- Direction widget. -->
    {#if showDirection}
        <div
            class="direction-widget-anchor"
            style="
                left: {
                    (
                        leafGeometry.bottomMidline
                        + leafGeometry.topMidline
                        - 3 / tweenedScale
                    ) / 2
                }px;
                top: {
                    (
                        leafGeometry.bottom
                        + leafGeometry.top
                    ) / 2
                }px;
                transform-origin: calc(right - {1.5 / tweenedScale}px) 50%;
                transform:
                    translate(-100%, -50%)
                    scaleY({mirroring})
                    rotate({
                        -rotation * mirroring
                        + (
                            halfAxisId === 3 ? -90 :
                            halfAxisId === 4 ? 90 :
                            0
                        )
                    }deg);
            "
        >
            <DirectionWidget
                direction={direction}
                halfAxisId={halfAxisId}
                {graphWidgetStyle}
                optionClickedFunction={(direction, _, __) => {
                    if (direction?.id) changeRelationshipDirection(direction.id)
                }}
            />
        </div>
    {/if}
</div>


<style>
    .relationship-leaf {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .leaf-hover-zone {
        opacity: 0;

        pointer-events: auto;
        cursor: pointer;
    }

    .leaf-image {
        opacity: 0.25;
    }

    .leaf-image.hovered {
        opacity: 0.5;
    }

    .leaf-image.clicked {
        opacity: 1;
    }

    .direction-widget-anchor {
        position: absolute;
        z-index: 2;
    }
</style>