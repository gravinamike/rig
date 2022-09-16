<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Graph, Direction, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import related widgets.
    import { DirectionWidget, RelationshipWidget } from "$lib/widgets/graphWidgets"
    import RelationshipStemWidget from "./stem.svelte"

    // Import widget controller.
    import RelationshipCohortWidgetController from "./controller.svelte"
    

    /**
     * @param  {ThingCohort} thingCohort - The Thing Cohort that is associated with this Relationship Cohort.
     * @param  {Graph} graph - The Graph that the Relationship Cohort is part of
     * @param  {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     */
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let thingWidth: number
    export let thingHeight: number


    // Attributes managed by widget controller.
    let widgetOffsetX: number
    let widgetOffsetY: number
    let zIndex: number
    let widgetWidth: number
    let widgetHeight: number
    let opacity: number
    let rotatedWidth: number
    let rotatedHeight: number
    let mirroring: 1 | -1
    let rotation: number
    let showDirection: boolean
    let direction: Direction
    let directionWidgetRotation: number
    let changeRelationshipsDirection: (directionId: number) => void
    let relationshipsWidth: number
    let relationshipsLength: number
    let tweenedScale: Tweened<number>
    let midline: number
    let stemBottom: number
    let stemTop: number
    let showRelationships: boolean

    // Attributes managed by sub-widgets.
    let thingIdOfHoveredRelationship: number | null = null
    let stemHovered = false
</script>



<!-- Widget controller. -->
<RelationshipCohortWidgetController
    {cohort}
    {graphWidgetStyle}
    {graph}
    {thingIdOfHoveredRelationship}
    {stemHovered}
    {thingWidth}
    {thingHeight}
    
    bind:widgetOffsetX
    bind:widgetOffsetY
    bind:zIndex
    bind:widgetWidth
    bind:widgetHeight
    bind:opacity
    bind:rotatedWidth
    bind:rotatedHeight
    bind:mirroring
    bind:rotation
    bind:showDirection
    bind:direction
    bind:directionWidgetRotation
    bind:changeRelationshipsDirection
    bind:relationshipsWidth
    bind:relationshipsLength
    bind:tweenedScale
    bind:midline
    bind:stemBottom
    bind:stemTop
    bind:showRelationships
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
        opacity: {opacity};
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

        <!-- Direction widget. -->
        {#if showDirection}
            <div
                class="direction-widget-anchor"
                style="
                    transform:
                        scaleY({mirroring})
                        rotate({directionWidgetRotation}deg);
                "
            >
                <DirectionWidget
                    {direction}
                    halfAxisId={cohort.halfAxisId}
                    {graphWidgetModel}
                    optionClickedFunction={(direction, _, __) => {
                        if (direction) changeRelationshipsDirection(direction.id)
                    }}
                />
            </div>
        {/if}

        <!-- Relationship image. -->
        <div
            class="relationship-image"
            style="
                width: {relationshipsWidth}px;
                height: {relationshipsLength}px;
            "
        >
            
            <!-- Relationship stem. -->
            {#if cohort.indexOfGrandparentThing === null}
                <RelationshipStemWidget
                    relationshipsWidgetModel={model}
                    {thingIdOfHoveredRelationship}
                    bind:stemHovered
                    tweenedScale={tweenedScale}
                    {midline}
                    {stemBottom}
                    {stemTop}
                    bind:graphWidgetModel
                />
            {/if}

            <!-- Relationship image. -->    
            {#if showRelationships}
                {#each model.relationshipWidgetModels as relationshipWidgetModel}
                    {#if cohort.indexOfGrandparentThing !== relationshipWidgetModel.cohortMemberWithIndex.index}<!-- Don't re-draw the existing Relationship to a parent Thing. -->                
                        <RelationshipWidget
                            model={relationshipWidgetModel}
                            {midline}
                            {stemTop}
                            {thingIdOfHoveredRelationship}
                            {graphWidgetModel}
                        />
                    {/if}
                {/each}
            {/if}
            
        </div>

    </div>
</div>


<style>
    .relationship-cohort-widget {
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: -1;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .rotator {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .relationship-image {
        position: absolute;

        overflow: visible;
    }

    .direction-widget-anchor {
        z-index: 2;
    }
</style>