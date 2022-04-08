<script context="module" lang="ts">
    // Type imports.
    import type { RelationshipsWidgetModel } from "$lib/models/widgetModels"

    // Stores imports.
    import { hoveredThingIdStore } from "$lib/stores"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { mirroringByHalfAxisId, relationshipColorByHalfAxisId, zoomBase } from "$lib/shared/constants"

    // Widget imports.
    import RelationshipStemWidget from "./relationshipStemWidget.svelte"
    import RelationshipFanSegmentWidget from "./relationshipFanSegmentWidget.svelte"
    import RelationshipLeafWidget from "./relationshipLeafWidget.svelte"
</script>

<script lang="ts">
    export let relationshipsWidgetModel: RelationshipsWidgetModel


    $: cohort = relationshipsWidgetModel.cohort
    $: graph = relationshipsWidgetModel.graph

    /* Information related to hovering. */
    let hoveredThingIdStoreValue: number | null = null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    let thingIdOfHoveredRelationship: number | null = null
    let stemHovered = false

    /* Basic Widget information. */
    
    // Information related to the Relationships Widget's place in the Graph.
    const halfAxisId = relationshipsWidgetModel.halfAxisId
    

    // Graph-scale-related variables.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    // Information related to Direction.
    const direction = relationshipsWidgetModel.direction
    $: showDirection = relationshipsWidgetModel.parentThingWidgetModel.address.generationId === 0 || stemHovered ?
        true :
        false


    // Calculate color and opacity of Relationship image.
    const relationshipColor = relationshipColorByHalfAxisId[halfAxisId]
    $: opacity = relationshipsWidgetModel.opacity



    /* Variables related to whole-Widget geometry. */

    // Variables related to the geometry of Graph construct widgets.
    $: relationDistance = graph.graphWidgetStyle.relationDistance // The center-to-center distance between two related Things.
    $: thingWidth = relationshipsWidgetModel.parentThingWidgetModel.thingWidth
    $: thingHeight = relationshipsWidgetModel.parentThingWidgetModel.thingHeight
    $: betweenThingSpacing = graph.graphWidgetStyle.betweenThingSpacing

    // Variables related to the x, y, and z position of this Relationships Widget (relative to parent Thing Widget).
    let xOffset: number
    let yOffset: number
    $: {
        relationDistance
        xOffset = relationshipsWidgetModel.xOffset
        yOffset = relationshipsWidgetModel.yOffset
    }
    const zIndex = relationshipsWidgetModel.zIndex

    // Variables related to rotation and mirroring of Relationship image.
    const rotation = relationshipsWidgetModel.rotation
    const mirroring = mirroringByHalfAxisId[halfAxisId]
    

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
    let leavesGeometries: { bottom: number, top: number, bottomMidline: number, topMidline: number }[]
    $: {
        relationDistance
        thingWidth
        thingHeight
        betweenThingSpacing
        $tweenedScale

        relationshipsWidth = relationshipsWidgetModel.relationshipsWidth
        relationshipsLength = relationshipsWidgetModel.relationshipsLength
        widgetWidth = relationshipsWidgetModel.widgetWidth
        widgetHeight = relationshipsWidgetModel.widgetHeight
        xOffsetToGrandparentThing = relationshipsWidgetModel.xOffsetToGrandparentThing
        yOffsetToGrandparentThing = relationshipsWidgetModel.yOffsetToGrandparentThing
        midline = relationshipsWidgetModel.midline
        stemBottom = relationshipsWidgetModel.stemBottom
        stemTop = relationshipsWidgetModel.stemTop
        leavesGeometries = relationshipsWidgetModel.leavesGeometries($tweenedScale)
    }


    // Construct a list of the related Things along with their indices.
    $: cohortMembersWithIndices = relationshipsWidgetModel.cohortMembersWithIndices
</script>


<!-- Outer Relationships Widget (doesn't rotate, but takes up appropriate dimensions). -->
<div
    class="relationships-widget"
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
        style="transform: scaleY({mirroring}) rotate({rotation * mirroring}deg); "
    >

        <!-- Direction text. -->
        {#if showDirection}
            <div
                class="direction-text {!cohort.members.length ? "empty" : ""}"
                style="
                    transform: scaleY({mirroring}) rotate({-rotation * mirroring + (halfAxisId === 3 ? -90 : (halfAxisId === 4 ? 90 : 0))}deg);
                    font-size: {graph.graphWidgetStyle.relationshipTextSize}px; color: {relationshipColor}
                "
            >
                {direction.text}
            </div>
        {/if}

        <!-- Relationship image. -->
        <svg
            class="relationship-image"
            style="
                width: {relationshipsWidth}px; height: {relationshipsLength}px;
                stroke: {relationshipColor}; fill: {relationshipColor};
            "
        >
            <!-- Relationship stem. -->
            {#if cohort.indexOfGrandparentThing === null}
                <RelationshipStemWidget
                    {relationshipsWidgetModel}
                    {hoveredThingIdStoreValue}
                    {thingIdOfHoveredRelationship}
                    bind:stemHovered
                    tweenedScale={$tweenedScale}
                    {midline}
                    {stemBottom}
                    {stemTop}
                />
            {/if}

            {#if !(cohort.members.length === 1 && cohort.indexOfGrandparentThing !== null)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
                {#each cohortMembersWithIndices as memberWithIndex}
                    {#if cohort.indexOfGrandparentThing !== memberWithIndex.index}<!-- Don't re-draw the existing Relationship to a parent Thing. -->
                        
                        <RelationshipFanSegmentWidget
                            {hoveredThingIdStoreValue}
                            bind:thingIdOfHoveredRelationship
                            tweenedScale={$tweenedScale}
                            {midline}
                            {stemTop}
                            {leavesGeometries}
                            cohortMemberWithIndex={memberWithIndex}
                        />

                         
                        {#if !(memberWithIndex.member.kind === "thingBaseWidgetModel")}
                            <RelationshipLeafWidget
                                {hoveredThingIdStoreValue}
                                bind:thingIdOfHoveredRelationship
                                tweenedScale={$tweenedScale}
                                {leavesGeometries}
                                cohortMemberWithIndex={memberWithIndex}
                            />
                        {/if}


                    {/if}
                {/each}
            {/if}
        </svg>

    </div>
</div>


<style>
    .relationships-widget {
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

    .direction-text {
        border-radius: 8px;

        background-color: white;

        padding: 0.25rem;

        pointer-events: auto;
    }

    .relationship-image {
        position: absolute;

        overflow: visible;
    }
</style>