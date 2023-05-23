<script lang="ts">
    // Import types.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"

    // Import stores.
    import {
        hoveredRelationshipTarget, enableRelationshipBeingCreated, setRelationshipBeingCreatedDestThingId,
        disableRelationshipBeingCreated,
        reorderingInfoStore,
        readOnlyMode
    } from "$lib/stores"
    

    // Import widget controller.
    import RelationshipStemWidgetController from "./controller.svelte"
    

    export let cohort: ThingCohort
    export let cohortMembersToDisplay: GenerationMember[]
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


    $: showStem = (
        relationshipsExist
        || ofPerspectiveThing
        || (relatableForCurrentDrag && stemHovered)
        || isDragRelateSource
    )
</script>


<!-- Widget controller. -->
<RelationshipStemWidgetController
    bind:cohort
    {graph}
    {thingIdOfHoveredRelationship}
    {cohortMembersToDisplay}

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
    on:click={ () => { if (!$readOnlyMode) addThingForm() } }
    on:keydown={()=>{}}
>

    <!-- Hoverable zone of stem. -->
    <line
        class="stem-hover-zone"
        class:readOnlyMode={$readOnlyMode}

        x1="{midline}" y1="{stemBottom}"
        x2="{midline}" y2="{stemTop + 10}"
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
        on:touchstart={ event => {
            stemClicked = true
            // Get X and Y coordinates.
            const clientX = event.touches.item(0)?.clientX
            const clientY = event.touches.item(0)?.clientY
            if (cohort.parentThingId && clientX && clientY) enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                cohort.parentThingId,
                1,
                cohort.halfAxisId,
                cohort.direction,
                [clientX, clientY]
            )
        }}
        on:mouseup={ () => {
            stemClicked = false
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(cohort.parentThingId)
            } else {
                disableRelationshipBeingCreated()
            }
        } }
        on:touchend={ () => {
            stemClicked = false
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(cohort.parentThingId)
            } else {
                disableRelationshipBeingCreated()
            }
        } }
    />

    <!-- Visual image of stem. -->
    <g
        class="
            stem-image
            {!$reorderingInfoStore.reorderInProgress && (stemHovered || relationshipHovered || thingHovered) ? "hovered" : ""}
            {stemClicked || isDragRelateSource ? "clicked" : ""}
        "
        class:hidden={!showStem}
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
        z-index: 2;
    }

    .stem-hover-zone {
        opacity: 0;

        pointer-events: auto;
        cursor: pointer;
    }

    .stem-hover-zone.readOnlyMode {
        pointer-events: none;
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