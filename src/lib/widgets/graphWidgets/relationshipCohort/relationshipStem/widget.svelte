<script lang="ts">
    // Import types.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"

    // Import stores.
    import {
        hoveredRelationshipTarget, enableRelationshipBeingCreated, setRelationshipBeingCreatedDestThingId,
        disableRelationshipBeingCreated,
        reorderingInfoStore,
        readOnlyMode,

        relationshipBeingCreatedInfoStore

    } from "$lib/stores"
    

    // Import widget controller.
    import RelationshipStemWidgetController from "./controller.svelte"
    import { elementUnderTouchEvent } from "$lib/shared/utility";
    

    export let thingCohort: ThingCohort
    export let thingCohortMembersToDisplay: GenerationMember[]
    export let graphWidgetStyle: GraphWidgetStyle
    export let graph: Graph

    export let tweenedScale: number
    export let midline: number
    export let stemBottom: number
    export let stemTop: number
    export let relationshipColor: string
    
    export let cladeHovered: boolean
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
        || cladeHovered
    )


    $: stemBottomOffsetFromThing =
        thingCohort.parentThing?.address?.generationId === 0 ? 6 :
        0

</script>


<!-- Widget controller. -->
<RelationshipStemWidgetController
    bind:thingCohort
    {graph}
    {thingIdOfHoveredRelationship}
    {thingCohortMembersToDisplay}

    bind:ofPerspectiveThing
    bind:relationshipsExist
    bind:relationshipHovered
    bind:thingHovered
    bind:isDragRelateSource
    bind:addThingForm
/>

<!-- Relationship Stem widget. -->
<svg
    id={`graph#${ graph.id }-thing#${ thingCohort.parentThingId }-halfAxis#${ thingCohort.halfAxisId }`}
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
        x2="{midline}" y2="{stemTop}"
        style="stroke-width: {25 / tweenedScale};"

        on:mouseenter={ () => {
            stemHovered = true
            hoveredRelationshipTarget.set(thingCohort)
        }}
        on:mouseleave={ () => {
            stemHovered = false
            stemClicked = false
            hoveredRelationshipTarget.set(null)
        }}
        on:mousedown={ event => {
            stemClicked = true
            if (thingCohort.parentThingId) enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                thingCohort.parentThingId,
                1,
                thingCohort.halfAxisId,
                thingCohort.direction,
                [event.clientX, event.clientY]
            )
        }}
        on:touchstart={ event => {
            stemClicked = true
            // Get X and Y coordinates.
            const clientX = event.touches.item(0)?.clientX
            const clientY = event.touches.item(0)?.clientY
            if (thingCohort.parentThingId && clientX && clientY) enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                thingCohort.parentThingId,
                1,
                thingCohort.halfAxisId,
                thingCohort.direction,
                [clientX, clientY]
            )
        }}
        on:mouseup={ () => {
            stemClicked = false
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(thingCohort.parentThingId)
            } else {
                disableRelationshipBeingCreated()
            }
        } }
        on:touchend={ (event) => {
            stemClicked = false



            const endingElement = elementUnderTouchEvent(event)


            if (
                endingElement?.className.includes("thing-widget")
                || endingElement?.className.includes("relationship-stem")
            ) {

                const targetThingId = Number(endingElement.id.split("-")[1].split("#")[1])

                const targetThingRelatableForCurrentDrag =
                    // The flag is true if...
                    (
                        // ...there is a drag-relate in progress...
                        $relationshipBeingCreatedInfoStore.sourceThingId
                        // ...and the source of the drag-relate is not *this* Thing.
                        && $relationshipBeingCreatedInfoStore.sourceThingId !== targetThingId
                    ) ?
                        true :
                        false

                if (targetThingRelatableForCurrentDrag) {
                    setRelationshipBeingCreatedDestThingId(targetThingId)
                } else {
                    disableRelationshipBeingCreated()
                }
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
            x1="{midline}" y1="{stemBottom - stemBottomOffsetFromThing}"
            x2="{midline}" y2="{stemTop + 6 / tweenedScale}"
            style="stroke-width: {10 / tweenedScale};"
        />
        <polygon
            points="
                {midline - 8 / tweenedScale}, {stemTop + 13 / tweenedScale}
                {midline + 8 / tweenedScale}, {stemTop + 13 / tweenedScale}
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