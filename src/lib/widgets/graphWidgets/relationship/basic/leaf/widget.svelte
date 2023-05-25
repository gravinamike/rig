<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Direction, Thing, GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import related widgets.
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"
    import RelationshipLeafWidgetController from "./controller.svelte"
    import { readOnlyMode } from "$lib/stores";


    /**
     * @param cohortMemberWithIndex -  Object containing the index and the Generation Member the widget is based on.
     * @param cohort - The Thing Cohort associated with this Relationship Cohort.
     * @param graph - The Graph which this Relationship is part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param thingIdOfHoveredRelationship - The ID of the Thing associated with any currently-hovered Relationship.
     * @param relatableForCurrentDrag - Whether the widget is a valid target for any current drag-relate operation.
     * @param relationshipColor - The color of the Relationship widget.
     * @param leafGeometry - Object containing coordinates for the leaf's key points.
     * @param tweenedScale - The scale of the Graph widget, smoothly interpolated between changes.
     * @param mirroring - Multiplication factor to flip the widget relative to the Graph center.
     * @param halfAxisId - The ID of the half-axis of the Relationship.
     * @param direction - The Direction of the Relationship.
     */
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let thingIdOfHoveredRelationship: number | null
    export let relatableForCurrentDrag: boolean
    export let relationshipColor: string
    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let tweenedScale: number
    export let mirroring: -1 |1
    export let rotation: number
    export let halfAxisId: HalfAxisId
    export let direction: Direction | null = null
    

    // Attributes handled by widget controller.
    let thing: Thing
    let leafHovered = false
    let leafClicked = false
    let highlightLevel: "no-highlight" | "soft-highlight" | "hard-highlight"
    let showDirection: boolean
    let changeRelationshipDirection: (directionId: number) => void
    let handleMouseDown: (event: MouseEvent | TouchEvent) => void
    let handleBodyMouseMove: (event: MouseEvent | TouchEvent) => void
    let handleBodyMouseUp: (event: MouseEvent | TouchEvent) => void
</script>


<!-- Widget controller. -->
<RelationshipLeafWidgetController
    {cohortMemberWithIndex}
    {cohort}
    {graph}
    {graphWidgetStyle}
    {thingIdOfHoveredRelationship}

    bind:thing
    bind:leafHovered
    bind:leafClicked
    bind:relatableForCurrentDrag
    bind:highlightLevel
    bind:showDirection
    bind:changeRelationshipDirection
    bind:handleMouseDown
    bind:handleBodyMouseMove
    bind:handleBodyMouseUp
/>

<!-- Set up handlers on the page body. -->
<svelte:body lang="ts"
    on:mousemove={handleBodyMouseMove}
    on:touchmove={handleBodyMouseMove}
    on:mouseup={handleBodyMouseUp}
    on:touchend={handleBodyMouseUp}
/>


<!-- Relationship leaf widget. -->
<div
    class="relationship-leaf"

    on:mouseenter={()=>{thingIdOfHoveredRelationship = thing.id || null}}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>

    <!-- Relationship leaf. -->
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
            class:rowCohort={ cohort?.rowOrColumn() === "row" }
            class:columnCohort={ cohort?.rowOrColumn() === "column" }
            class:read-only-mode={$readOnlyMode}

            x1="{leafGeometry.bottomMidline}" y1="{leafGeometry.bottom - 10}"
            x2="{leafGeometry.topMidline}" y2="{leafGeometry.top}"
            style="stroke-width: {8 / tweenedScale};"

            on:mouseenter={()=>{leafHovered = true}}
            on:mouseleave={()=>{leafHovered = false}}
            on:mousedown={ (event) => {
                leafClicked = true
                if (event.button === 0) handleMouseDown(event)
            }}
            on:touchstart={(event) => {
                leafClicked = true
                handleMouseDown(event)
            }}
            on:mouseup={()=>{leafClicked = false}}
            on:touchend={()=>{leafClicked = false}}
        />

        <!-- Visual image of leaf. -->
        <line
            class="leaf-image"
            class:soft-highlight={ highlightLevel === "soft-highlight" }
            class:hard-highlight={ highlightLevel === "hard-highlight" }
            
            x1="{leafGeometry.bottomMidline}" y1="{leafGeometry.bottom}"
            x2="{leafGeometry.topMidline}" y2="{leafGeometry.top}"
            style="stroke-width: {3 / tweenedScale};"
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
            <DirectionDropdownWidget
                startingDirection={direction}
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

        pointer-events: none;
    }

    .leaf-hover-zone:not(.read-only-mode) {
        pointer-events: auto;
    }

    .leaf-hover-zone.rowCohort {
        cursor: col-resize;
    }

    .leaf-hover-zone.columnCohort {
        cursor: row-resize;
    }

    .leaf-image {
        opacity: 0.25;
    }

    .leaf-image.soft-highlight {
        opacity: 0.5;
    }

    .leaf-image.hard-highlight {
        opacity: 1;
    }

    .direction-widget-anchor {
        position: absolute;
        z-index: 2;
    }
</style>