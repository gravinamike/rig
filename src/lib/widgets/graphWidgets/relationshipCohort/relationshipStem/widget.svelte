<script lang="ts">
    // Import types.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Graph, ThingCohort } from "$lib/models/constructModels"

    // Import stores.
    import {
        hoveredRelationshipTarget, enableRelationshipBeingCreated, setRelationshipBeingCreatedDestThingId
    } from "$lib/stores"
    

    // Import widget controller.
    import RelationshipStemWidgetController from "./controller.svelte"
    

    export let cohort: ThingCohort
    export let graphWidgetStyle: GraphWidgetStyle
    export let graph: Graph

    export let tweenedScale: number
    export let midline: number
    export let stemBottom: number
    export let stemTop: number
    export let relationshipColor: string
    
    export let thingIdOfHoveredRelationship: number | null
    export let stemHovered: boolean
    export let relatableForCurrentDrag: boolean


    // Attributes handled by widget controller.
    let stemClicked = false
    let ofPerspectiveThing = false
    let relationshipsExist = false
    let relationshipHovered = false
    let thingHovered = false
    let isDragRelateSource = false
    let addThingForm = async () => {}
</script>


<!-- Widget controller. -->
<RelationshipStemWidgetController
    {cohort}
    {graph}
    {thingIdOfHoveredRelationship}

    bind:ofPerspectiveThing
    bind:relationshipsExist
    bind:relationshipHovered
    bind:thingHovered
    bind:isDragRelateSource
    bind:addThingForm
/>

<!-- Relationship Stem widget. -->
<svg
    class="relationship-stem"
    style="
        stroke: {relationshipColor};
        fill: {relationshipColor};
    "
    on:click={addThingForm}
>

    <!-- Hoverable zone of stem. -->
    <line
        class="stem-hover-zone"
        x1="{midline}" y1="{stemBottom}"
        x2="{midline}" y2="{stemTop}"
        style="stroke-width: {20 / tweenedScale};"
        on:mouseenter={ () => {
            stemHovered = true
            hoveredRelationshipTarget.set(cohort)
        }}
        on:mouseleave={ () => {
            stemHovered = false
            stemClicked = false
            hoveredRelationshipTarget.set(null)
        }}
        on:mousedown={ event => {
            stemClicked = true
            if (cohort.parentThingId) enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                cohort.parentThingId,
                1,
                cohort.halfAxisId,
                cohort.direction,
                [event.clientX, event.clientY]
            )
        }}
        on:mouseup={ () => {
            stemClicked = false
            if (relatableForCurrentDrag) setRelationshipBeingCreatedDestThingId(cohort.parentThingId)
        } }
    />

    <!-- Visual image of stem. -->
    <g
        class="
            stem-image
            {relationshipsExist || ofPerspectiveThing || (relatableForCurrentDrag && stemHovered) || isDragRelateSource ? "" : "hidden"}
            {stemHovered || relationshipHovered || thingHovered ? "hovered" : ""}
            {stemClicked || isDragRelateSource ? "clicked" : ""}
        "
    >
        <line
            x1="{midline}" y1="{stemBottom}"
            x2="{midline}" y2="{stemTop + 6 / tweenedScale}"
            style="stroke-width: {10 / tweenedScale};"
        />
        <polygon
            points="
                {midline - 5 / tweenedScale}, {stemTop + 8 / tweenedScale}
                {midline + 5 / tweenedScale}, {stemTop + 8 / tweenedScale}
                {midline}, {stemTop}
            "
            style="stroke-width: {3 / tweenedScale};"
        />
    </g>

</svg>


<style>
    svg {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .stem-hover-zone {
        opacity: 0;

        pointer-events: auto;
        cursor: pointer;
    }

    .stem-image {
        opacity: 0.25;
    }

    .stem-image.hidden {
        visibility: hidden;
    }

    .stem-image.hovered {
        opacity: 0.5;
    }

    .stem-image.clicked {
        opacity: 1.0;
    }
</style>