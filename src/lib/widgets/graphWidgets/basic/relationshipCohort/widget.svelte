<script lang="ts">
    // Type imports.
    import type { Graph, Thing, ThingCohort } from "$lib/models/constructModels"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { zoomBase, type HalfAxisId } from "$lib/shared/constants"

    import { storeGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Widget imports.
    import RelationshipStemWidget from "./stem.svelte"
    import { RelationshipWidget } from "$lib/widgets/graphWidgets"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"

    import { updateRelationships } from "$lib/db/clientSide"

    import RelationshipCohortWidgetController from "./controller.svelte"
    import type { GraphWidgetStyle } from "../graph";

    /**
     * @param  {GraphWidgetModel} graphWidgetModel - The Graph that the Relationships are in.
     */
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    /*export let halfAxisId: HalfAxisId
    export let parentThing: Thing
    export let thingWidth: number
    export let thingHeight: number
    export let xOffset: number
    export let yOffset: number
    export let relationshipsWidth: number
    export let relationshipsLength: number
    export let widgetWidth: number
    export let widgetHeight: number
    export let xOffsetToGrandparentThing: number
    export let yOffsetToGrandparentThing: number
    export let midline: number
    export let stemBottom: number
    export let stemTop: number
    export let zIndex: number
    export let opacity: number
    export let mirroring: 1 | -1
    export let rotation: number
    export let direction: number*/





    /* Information related to hovering. */
    let thingIdOfHoveredRelationship: number | null = null
    let stemHovered = false


    /* Basic Widget information. */
    
    // Graph-scale-related variables.
    $: scale = zoomBase ** graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    // Information related to Direction.
    $: showDirection = (
        (parentThing && parentThing.address.generationId === 0 || stemHovered)
        && !thingIdOfHoveredRelationship
    ) ?
        true :
        false


    /* Variables related to whole-Widget geometry. */

    // Variables related to the geometry of Graph construct widgets.
    $: relationDistance = graphWidgetStyle.relationDistance // The center-to-center distance between two related Things.
   
    $: betweenThingSpacing = graphWidgetStyle.betweenThingSpacing
    $: betweenThingOverlap = graphWidgetStyle.betweenThingOverlap
    


    async function changeRelationshipsDirection(directionId: number) {//////////////////////// MOVE TO MODEL
        const sourceThingId = parentThing.id as number
        const destThingIds = cohort.members.map(member => member.thingId)

        const relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number }[] = []
        for (const destThingId of destThingIds) {
            if (destThingId) {
                relationshipInfos.push( { sourceThingId: sourceThingId, destThingId: destThingId, directionId: directionId } )
            } else {
                console.log("Relationship info is missing - aborting operation.")
                return
            }
        }

        const relationshipsUpdated = await updateRelationships(relationshipInfos)
        if (relationshipsUpdated) {
            await storeGraphConstructs<Thing>("Thing", sourceThingId, true)
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }

</script>




<RelationshipCohortWidgetController
    {graph}
    {halfAxisId}
    
    bind:parentThing
    bind:thingWidth
    bind:thingHeight
    bind:xOffset
    bind:yOffset
    bind:relationshipsWidth
    bind:relationshipsLength
    bind:widgetWidth
    bind:widgetHeight
    bind:xOffsetToGrandparentThing
    bind:yOffsetToGrandparentThing
    bind:midline
    bind:stemBottom
    bind:stemTop
    bind:zIndex
    bind:opacity
    bind:mirroring
    bind:rotation
    bind:direction
/>








<!-- Outer Relationships Widget (doesn't rotate, but takes up appropriate dimensions). -->
<div
    class="relationship-cohort-widget"
    style="
        left: calc(50% + {xOffset}px + {xOffsetToGrandparentThing}px);
        top: calc(50% + {yOffset}px + {yOffsetToGrandparentThing}px);
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
            width: { [1, 2].includes(halfAxisId) ? widgetWidth : widgetHeight }px;
            height: { [1, 2].includes(halfAxisId) ? widgetHeight : widgetWidth }px;
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
                    {direction}
                    {halfAxisId}
                    {graphWidgetModel}
                    optionClickedFunction={(direction, _, __) => {
                        if (direction?.id) changeRelationshipsDirection(direction.id)
                    }}
                />
            </div>
        {/if}

        <!-- Relationship image. -->
        <div
            class="relationship-image"
            style="
                width: {relationshipsWidth}px; height: {relationshipsLength}px;
            "
        >
            
            <!-- Relationship stem. -->
            {#if cohort.indexOfGrandparentThing === null}
                <RelationshipStemWidget
                    relationshipsWidgetModel={model}
                    {thingIdOfHoveredRelationship}
                    bind:stemHovered
                    tweenedScale={$tweenedScale}
                    {midline}
                    {stemBottom}
                    {stemTop}
                    bind:graphWidgetModel
                />
            {/if}

            <!-- Relationship image. -->    
            {#if
                !(
                    cohort.members.length === 1
                    && cohort.indexOfGrandparentThing !== null
                )
            }
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