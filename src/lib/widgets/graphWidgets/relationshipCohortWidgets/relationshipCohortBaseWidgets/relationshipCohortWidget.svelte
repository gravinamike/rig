<script context="module" lang="ts">
    // Type imports.
    import type { Thing, Graph } from "$lib/models/graphModels"
    import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { zoomBase } from "$lib/shared/constants"

    import { storeGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Widget imports.
    import RelationshipStemWidget from "./relationshipStemWidget.svelte"
    import RelationshipFanSegmentWidget from "./relationshipFanSegmentWidget.svelte"
    import RelationshipLeafWidget from "./relationshipLeafWidget.svelte"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"

    import { updateRelationships } from "$lib/db/clientSide"
</script>

<script lang="ts">
    /**
     * @param  {RelationshipsWidgetModel} model - The Relationships Widget Model used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Relationships are in.
     */
    export let model: RelationshipCohortWidgetModel
    export let graph: Graph


    /* Information related to hovering. */
    let thingIdOfHoveredRelationship: number | null = null
    let stemHovered = false


    /* Basic Widget information. */
    
    // Information related to the Relationships Widget's place in the Graph.
    const halfAxisId = model.halfAxisId
    
    // Graph-scale-related variables.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    // Information related to Direction.
    $: showDirection = (
        (model.parentThingWidgetModel.address.generationId === 0 || stemHovered)
        && !thingIdOfHoveredRelationship
    ) ?
        true :
        false


    /* Variables related to whole-Widget geometry. */

    // Variables related to the geometry of Graph construct widgets.
    $: relationDistance = graph.graphWidgetStyle.relationDistance // The center-to-center distance between two related Things.
    $: thingWidth = model.parentThingWidgetModel.thingWidth
    $: thingHeight = model.parentThingWidgetModel.thingHeight
    $: betweenThingSpacing = graph.graphWidgetStyle.betweenThingSpacing
    $: betweenThingOverlap = graph.graphWidgetStyle.betweenThingOverlap

    // Variables related to the x, y, and z position of this Relationships Widget (relative to parent Thing Widget).
    let xOffset: number
    let yOffset: number
    
    // Variables related to the widths and heights of this Relationships Widget.
    let relationshipsWidth: number
    let relationshipsLength: number
    let widgetWidth: number
    let widgetHeight: number

    /* Variables related to the geometries of the Widget's parts. */
    let xOffsetToGrandparentThing: number
    let yOffsetToGrandparentThing: number
    let midline: number
    let stemBottom: number
    let stemTop: number


    /* Reactive re-calculations. */
    $: {
        relationDistance

        xOffset = model.xOffset
        yOffset = model.yOffset
    }

    $: {
        relationDistance; thingWidth; thingHeight; betweenThingSpacing; betweenThingOverlap; $tweenedScale

        relationshipsWidth = model.relationshipsWidth
        relationshipsLength = model.relationshipsLength
        widgetWidth = model.widgetWidth
        widgetHeight = model.widgetHeight
        xOffsetToGrandparentThing = model.xOffsetToGrandparentThing
        yOffsetToGrandparentThing = model.yOffsetToGrandparentThing
        midline = model.midline
        stemBottom = model.stemBottom
        stemTop = model.stemTop
    }



    async function changeRelationshipsDirection(directionId: number) {
        const sourceThingId = model.parentThingWidgetModel.thingId as number
        const destThingIds = model.cohort.members.map(thingWidgetModel => thingWidgetModel.thingId)

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


<!-- Outer Relationships Widget (doesn't rotate, but takes up appropriate dimensions). -->
<div
    class="relationship-cohort-widget"
    style="
        left: calc(50% + {xOffset}px + {xOffsetToGrandparentThing}px);
        top: calc(50% + {yOffset}px + {yOffsetToGrandparentThing}px);
        z-index: {model.zIndex};
        width: {widgetWidth}px;
        height: {widgetHeight}px;
        opacity: {model.opacity};
    "
>
    <!-- Inner "rotator" which is rotated according to the Half-Axis. -->
    <div
        class="rotator"
        style="
            width: { [1, 2].includes(halfAxisId) ? widgetWidth : widgetHeight }px;
            height: { [1, 2].includes(halfAxisId) ? widgetHeight : widgetWidth }px;
            transform: scaleY({model.mirroring}) rotate({model.rotation * model.mirroring}deg);
        "
    >

        <!-- Direction widget. -->
        {#if showDirection}
            <div
                class="direction-widget-anchor"
                style="
                    transform:
                        scaleY({model.mirroring})
                        rotate({
                            -model.rotation * model.mirroring
                            + (
                                halfAxisId === 3 ? -90 :
                                halfAxisId === 4 ? 90 :
                                0
                            )
                        }deg);
                "
            >
                <DirectionWidget
                    direction={model.direction}
                    {halfAxisId}
                    {graph}
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
            {#if model.cohort.indexOfGrandparentThing === null}
                <RelationshipStemWidget
                    relationshipsWidgetModel={model}
                    {thingIdOfHoveredRelationship}
                    bind:stemHovered
                    tweenedScale={$tweenedScale}
                    {midline}
                    {stemBottom}
                    {stemTop}
                    bind:graph
                />
            {/if}

            {#if
                !(
                    model.cohort.members.length === 1
                    && model.cohort.indexOfGrandparentThing !== null
                )
            }<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
                {#each model.relationshipWidgetModels as relationshipWidgetModel}
                    {#if model.cohort.indexOfGrandparentThing !== relationshipWidgetModel.cohortMemberWithIndex.index}<!-- Don't re-draw the existing Relationship to a parent Thing. -->
                                                
                        {#if !(relationshipWidgetModel.cohortMemberWithIndex.member.kind === "thingBaseWidgetModel")}
                            <RelationshipLeafWidget
                                relationshipsWidgetModel={model}
                                bind:thingIdOfHoveredRelationship
                                tweenedScale={$tweenedScale}
                                leafGeometry={relationshipWidgetModel.leafGeometry($tweenedScale)}
                                cohortMemberWithIndex={relationshipWidgetModel.cohortMemberWithIndex}
                            />
                        {/if}

                        <RelationshipFanSegmentWidget
                            relationshipsWidgetModel={model}
                            bind:thingIdOfHoveredRelationship
                            tweenedScale={$tweenedScale}
                            {midline}
                            {stemTop}
                            leafGeometry={relationshipWidgetModel.leafGeometry($tweenedScale)}
                            cohortMemberWithIndex={relationshipWidgetModel.cohortMemberWithIndex}
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