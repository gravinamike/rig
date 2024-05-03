<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Direction, GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"

    // Import related widgets.
    import { DirectionWidget } from "$lib/widgets/spaceWidgets"
    import { RelationshipWidget } from "$lib/widgets/graphWidgets"
    import { RelationshipStemWidget } from "./relationshipStem"

    // Import widget controller.
    import RelationshipCohortWidgetController from "./controller.svelte"
    import DbLatestViewer from "$lib/viewers/dbViewers/dbLatestViewer.svelte";




    /**
     * @param graph - The Graph that the Relationship Cohort is part of
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param cladeHovered - Whether the Clade that this Thing Cohort is part of is mouse-hovered.
     * @param thingCohort - The Thing Cohort that is associated with this Relationship Cohort.
     * @param thingCohortMembersToDisplay - Array of the Thign Cohort members which should be rendered.
     * @param thingCohortExpanded - Whether the corresponding Thing Cohort is expanded or collapsed.
     * @param thingWidth - The width of a Thing widget.
     * @param thingHeight - The height of a Thing widget.
     * @param offsetToAlignToGrid - The offset, in pixels, needed to align the Relationships to the grid (if in use).
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let cladeHovered: boolean
    export let thingCohort: ThingCohort
    export let thingCohortMembersToDisplay: GenerationMember[]
    export let thingCohortExpanded: boolean
    export let thingWidth: number
    export let thingHeight: number
    export let offsetToAlignToGrid: number



    
    // Attributes managed by widget controller.
    let ofPerspectiveThing = false
    let widgetOffsetX = 0
    let widgetOffsetY = 0
    let zIndex = 0
    let widgetWidth = 0
    let widgetHeight = 0
    let rotatedWidth = 0
    let rotatedHeight = 0
    let mirroring: 1 | -1 = 1
    let rotation = 0
    let showDirection = false
    let direction: Direction | null = null
    let directionWidgetTop = 0
    let directionWidgetRotation = 0
    let relationshipsWidth = 0
    let relationshipsLength = 0
    let tweenedScale: Tweened<number> = tweened( 1, { duration: 100, easing: cubicOut } )
    let midline = 0
    let stemBottom = 0
    let stemTop = 0
    let fanBottom = 0
    let showRelationshipStem = false
    let showRelationships = false
    let relationshipColor = "#000000"
    let halfAxisId: HalfAxisId = 0
    let sizeOfThingsAlongWidth = 0
    let addThingSymbolOffsetAlongThingCohortLength = 0
    let relatableForCurrentDrag = false
    let directionWidgetInteractionDisabled = false
    let directionWidgetPartOpaque = false
    let directionWidgetForceFullyOpaque = false
    let showAddThingSymbol = false
    let changeRelationshipsDirection: (directionId: number) => void
    let onDirectionWidgetOptionClicked: (direction: Direction | null, _: number, __: Direction) => void

    // Attributes managed by sub-widgets.
    let thingIdOfHoveredRelationship: number | null = null
    let stemHovered = false
    let relationshipHovered = false







   




    




</script>



<!-- Widget controller. -->
<RelationshipCohortWidgetController
    {thingCohort}
    {graphWidgetStyle}
    {graph}
    {thingIdOfHoveredRelationship}
    {cladeHovered}
    {stemHovered}
    {relationshipHovered}
    {thingWidth}
    {thingHeight}
    {offsetToAlignToGrid}
    
    bind:ofPerspectiveThing
    bind:widgetOffsetX
    bind:widgetOffsetY
    bind:zIndex
    bind:widgetWidth
    bind:widgetHeight
    bind:rotatedWidth
    bind:rotatedHeight
    bind:mirroring
    bind:rotation
    bind:showDirection
    bind:direction
    bind:directionWidgetTop
    bind:directionWidgetRotation
    bind:relationshipsWidth
    bind:relationshipsLength
    bind:tweenedScale
    bind:midline
    bind:stemBottom
    bind:stemTop
    bind:fanBottom
    bind:showRelationshipStem
    bind:showRelationships
    bind:relationshipColor
    bind:halfAxisId
    bind:sizeOfThingsAlongWidth
    bind:addThingSymbolOffsetAlongThingCohortLength
    bind:relatableForCurrentDrag
    bind:directionWidgetInteractionDisabled
    bind:directionWidgetPartOpaque
    bind:directionWidgetForceFullyOpaque
    bind:showAddThingSymbol
    bind:changeRelationshipsDirection
    bind:onDirectionWidgetOptionClicked
/>


<!-- Outer Relationships Widget (doesn't rotate, but takes up appropriate dimensions). -->
<div
    class="relationship-cohort-widget"
    style="
        left: calc(50% + {widgetOffsetX}px);
        top: calc(50% + {widgetOffsetY}px);
        z-index: {zIndex};
        width: {widgetWidth}px;
        height: {widgetHeight}px;
    "
>
    <!-- Inner "rotator" which is rotated according to the Half-Axis. -->
    <div
        class="rotator"
        style="
            width: {rotatedWidth}px;
            height: {rotatedHeight}px;
            transform: scaleY({mirroring}) rotate({rotation * mirroring}deg);
        "
    >

        <!-- Relationship images. -->
        <div
            class="relationship-images"
            style="
                width: {relationshipsWidth}px;
                height: {relationshipsLength}px;
            "
        >
            <!-- Relationship stem. -->
            {#if showRelationshipStem}
                <RelationshipStemWidget
                    bind:thingCohort
                    {thingCohortMembersToDisplay}
                    bind:graph
                    {graphWidgetStyle}
                    {cladeHovered}
                    {thingIdOfHoveredRelationship}
                    bind:stemHovered
                    tweenedScale={$tweenedScale || 1}
                    {midline}
                    {stemBottom}
                    {stemTop}
                    directionWidgetOffsetFromRelationshipsTop={directionWidgetTop}
                    {relationshipsLength}
                    {relationshipColor}
                    {relatableForCurrentDrag}
                    bind:relationshipHovered
                />
            {/if}

            <!-- Relationship widgets. -->    
            {#if showRelationships}
                {#each Array.from(thingCohortMembersToDisplay.entries()) as [index, member]}
                    {#if
                        // Don't re-draw the existing Relationship to a parent Thing.
                        thingCohort.indexOfGrandparentThing !== index

                        // Don't show Relationships in the Relationships-only Generation if the
                        // Thing doesn't already exist in the Graph
                        && !(thingCohort.generation?.isRelationshipsOnly && !member.alreadyRendered)
                    }             
                        <RelationshipWidget
                            thingCohortMemberWithIndex={ {index: index, member: member} }
                            {thingCohort}
                            {graph}
                            {graphWidgetStyle}
                            {midline}
                            {fanBottom}
                            bind:thingIdOfHoveredRelationship
                            {halfAxisId}
                            {thingWidth}
                            {thingHeight}
                            {relationshipsLength}
                            {sizeOfThingsAlongWidth}
                            {thingCohortExpanded}
                            {relationshipColor}
                            {mirroring}
                            {rotation}
                            {direction}
                            {relatableForCurrentDrag}
                        />
                    {/if}
                {/each}
            {/if}
        </div>
        
        <!-- Direction widget. -->
        {#if showDirection}
            <div
                class="direction-widget-anchor"
                style="
                    top: {directionWidgetTop}px;
                    transform:
                        translate(-50%, -50%)
                        scaleY({mirroring})
                        rotate({directionWidgetRotation}deg);
                "
            >
                <DirectionWidget
                    startingDirection={direction}
                    halfAxisId={thingCohort.halfAxisId}
                    {graphWidgetStyle}
                    optionClickedFunction={onDirectionWidgetOptionClicked}
                    interactionDisabled={directionWidgetInteractionDisabled}
                    partOpaque={directionWidgetPartOpaque}
                    forceFullyOpaque={directionWidgetForceFullyOpaque}
                />
            </div>
        {/if}

        <!-- Add-Thing symbol. -->
        {#if showAddThingSymbol}
            <div
                class="add-thing-symbol"

                style="
                    left: calc({
                        thingCohort.members.length ? 50 :
                        0
                    }% + {addThingSymbolOffsetAlongThingCohortLength}px);
                    top: -{thingHeight}px;
                    width: {thingWidth}px;
                    height: {thingHeight}px;
                "
            >
                <div>+</div>
            </div>
        {/if}
    </div>
</div>


<style>
    .relationship-cohort-widget {
        position: absolute;
        transform: translate(-50%, -50%);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .rotator {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .relationship-images {
        position: absolute;

        overflow: visible;
    }

    .direction-widget-anchor {
        position: absolute;
        left: 50%;
        width: fit-content;
        height: fit-content;
        z-index: 2;
    }

    .add-thing-symbol {
        border-radius: 8px;
        outline: dotted 2px lightgrey;
        outline-offset: -2px;

        position: absolute;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        font-size: 70px;
        font-weight: 900px;
        color: lightgrey;
    }
</style>