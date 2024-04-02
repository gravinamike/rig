<script lang="ts">
    // Import types.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"

    // Import stores.
    import {
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated,
        setRelationshipBeingCreatedDestThingId, hoveredRelationshipTarget,
        disableRelationshipBeingCreated, reorderingInfoStore, preventEditing
    } from "$lib/stores"

    // Import utility functions.
    import { elementUnderTouchEvent } from "$lib/shared/utility"

    // Import widget controller.
    import RelationshipStemWidgetController from "./controller.svelte"

    

    export let thingCohort: ThingCohort
    export let thingCohortMembersToDisplay: GenerationMember[]
    export let graphWidgetStyle: GraphWidgetStyle
    export let graph: Graph

    export let tweenedScale: number
    export let midline: number
    export let stemBottom: number
    export let stemTop: number
    export let directionWidgetOffsetFromRelationshipsTop: number
    export let relationshipsLength: number
    export let relationshipColor: string
    
    export let cladeHovered: boolean
    export let thingIdOfHoveredRelationship: number | null
    export let stemHovered: boolean
    export let relatableForCurrentDrag: boolean

    export let relationshipHovered: boolean



    // Attributes handled by widget controller.
    let stemClicked = false
    let ofPerspectiveThing = false
    let relationshipsExist = false
    let thingHovered = false
    let isDragRelateSource = false
    let addThingForm = async () => {}


    $: showStem = (
        (relationshipsExist && thingCohort.indexOfGrandparentThing === null)
        || ofPerspectiveThing
        || (relatableForCurrentDrag && thingCohort.indexOfGrandparentThing === null && stemHovered)
        || isDragRelateSource
        || cladeHovered
    )


    $: showDirectionCircle =
        (
            (
                ofPerspectiveThing
                || thingCohort.members
                    .filter(thingCohortMember => thingCohortMember.alreadyRendered === false)
                    .length > 1
                || cladeHovered
                || stemHovered
            )
            && !relationshipHovered
        )

    $: stemBottomOffsetFromThing =
        thingCohort.parentThing?.address?.generationId === 0 && showDirectionCircle ? 6 :
        0


    $: popupOnCladeHover = (
        !ofPerspectiveThing
        && cladeHovered
    )
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
    
    on:click={ () => { if (!$preventEditing) addThingForm() } }
    on:keydown={()=>{}}
>

    <!-- Hoverable zone of stem. -->
    <g
        class="stem-hover-zone"
        class:hidden={!showStem}
        class:readOnlyMode={$preventEditing}

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
    >
    
        <line
            x1="{midline}" y1="{stemBottom}"
            x2="{midline}" y2="{stemTop}"
            style="stroke-width: {30 / tweenedScale};"
        />

        <line
            x1="{midline}" y1="{stemBottom}"
            x2="{midline}" y2="{stemBottom - (relationshipsLength - directionWidgetOffsetFromRelationshipsTop)}"
            style="stroke-width: 64;"
        />

        {#if showDirectionCircle}
            <circle
                cx={midline}
                cy={directionWidgetOffsetFromRelationshipsTop}
                r={32}
            />
        {/if}
    </g>


    <!-- Visual image of stem. -->
    <g
        class="stem-image"
        class:hidden={!showStem}
        class:hovered={
            !$reorderingInfoStore.reorderInProgress
            && (stemHovered || relationshipHovered || thingHovered)
        }
        class:clicked={ stemClicked || isDragRelateSource}
        class:drag-relate-source={isDragRelateSource}
        class:thing-cohort-has-things={thingCohort.members.length}
        class:popup-on-clade-hover={popupOnCladeHover}
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

        {#if
            showDirectionCircle
        }
            <circle
                cx={midline}
                cy={directionWidgetOffsetFromRelationshipsTop}
                r={32}
            />
        {/if}
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

    .stem-hover-zone.hidden {
        visibility: hidden;
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

    .stem-image:not(.thing-cohort-has-things):not(.hovered) {
        opacity: 0.1;
    }

    .stem-image.popup-on-clade-hover:not(.hovered) {
        opacity: 0.5;
    }

    .stem-image.clicked {
        opacity: 1.0;
    }

    .stem-image.drag-relate-source {
        opacity: 1.0 !important;
    }
</style>