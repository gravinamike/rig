<script context="module" lang="ts">
    import type { Thing, GenerationMember, ThingCohort } from "$lib/models/constructModels"
    import { getGraphConstructs, addGraphIdsNeedingViewerRefresh, relationshipBeingCreatedInfoStore, hoveredThingIdStore, hoveredRelationshipTarget, reorderingInfoStore } from "$lib/stores"
    import { XButton } from "$lib/widgets/layoutWidgets"
</script>

<script lang="ts">
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let midline: number
    export let stemTop: number
    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let relationshipColor: string
    export let relatableForCurrentDrag: boolean


    let fanSegmentHovered = false
    $: thing = cohortMemberWithIndex.member.thing as Thing
    $: thingHovered = thing.id === $hoveredThingIdStore
    $: relationshipHovered = thing.id && thing.id === thingIdOfHoveredRelationship
    let fanSegmentClicked = false

    async function deleteRelationship() {
        const graph = (cohortMemberWithIndex.member.thing as Thing).graph
        const sourceThingId = thing.parentThing?.id || null
        const sourceThing = thing?.parentThing || null
        const destThingId = thingIdOfHoveredRelationship
        const destThing = thingIdOfHoveredRelationship ?
            getGraphConstructs("Thing", thingIdOfHoveredRelationship) as Thing :
            null

        // Check both Things. If either has only 1 Relationship, warn the user that that
        // Thing will be isolated and ask them to confirm.
        for (const thing of [sourceThing, destThing]) {
            if (thing) {
                if (thing.relationshipInfos.length === 1) {
                    if (confirm(`The Thing named "${thing.text}" will be isolated if you delete this Relationship. Continue?`)) {
                        break
                    } else {
                        return
                    } 
                }
            }
        }

        if (graph && sourceThingId && destThingId) {
            await graph.deleteRelationshipByThingIds(sourceThingId, destThingId)
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }



    $: sourceThingId = thing.parentThing?.id || null
    $: destThingId = thing.id
    $: dragSourceThingId = $relationshipBeingCreatedInfoStore.sourceThingId
    $: dragDestThingId = $hoveredRelationshipTarget ?
        (
            $hoveredRelationshipTarget.kind === "thing" ?
                ($hoveredRelationshipTarget as Thing).id :
                ($hoveredRelationshipTarget as ThingCohort).parentThingId
        ) :
        null
    $: willBeDeleted = (
        sourceThingId && destThingId && dragSourceThingId && dragDestThingId
        && (
            ( sourceThingId === dragSourceThingId && destThingId === dragDestThingId )
            || ( sourceThingId === dragDestThingId && destThingId === dragSourceThingId )
        )
    ) ?
        true :
        false









    




    
    $: highlightLevel =
        // If... 
        (
            // ...the widget is clicked...  
            fanSegmentClicked
            // ...or the Relationship is being reordered...
            || $reorderingInfoStore.destThingId === cohortMemberWithIndex.member.thingId
        // The highlight is hard.
        ) ? "hard-highlight" :

        // Else, if...
        (
            // ...the widget, its parent Relationship widget, or the associated Thing are hovered...
            (fanSegmentHovered || relationshipHovered || thingHovered)
            // ...and the highlight is not being suppressed to indicate that this widget is
            // not relatable for a current drag-relate operation...
            && !(
                $relationshipBeingCreatedInfoStore.sourceThingId
                && !relatableForCurrentDrag
            )
        // The highlight is soft.
        ) ? "soft-highlight" :

        // Otherwise, the widget isn't highlighted.
        "no-highlight"





</script>


<!-- Relationship fan segment. -->
<svg
    class="relationship-fan-segment"
    style="
        stroke: {relationshipColor};
        fill: {relationshipColor};
    "
    on:mouseenter={()=>{
        thingIdOfHoveredRelationship = thing.id || null
    }}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>
 
    <!-- Hoverable zone of fan segment. -->
    <line
        class="fan-segment-hover-zone"
        x1="{midline}" y1="{stemTop}"
        x2="{leafGeometry.bottomMidline}" y2="{leafGeometry.bottom}"
        style="stroke-width: {8 / tweenedScale};"
        
        on:mouseenter={()=>{fanSegmentHovered = true}}
        on:mouseleave={()=>{fanSegmentHovered = false}}
        on:mousedown={()=>{fanSegmentClicked = true}}
        on:mouseup={()=>{fanSegmentClicked = false}}
    />

    <!-- Visual image of fan segment. -->
    <line 
        class="fan-segment-image"
        class:soft-highlight={ highlightLevel === "soft-highlight" }
        class:hard-highlight={ highlightLevel === "hard-highlight" }

        style="stroke-width: {3 / tweenedScale};"
        x1="{midline}" y1="{stemTop}"
        x2="{leafGeometry.bottomMidline}" y2="{leafGeometry.bottom}"
    />

    <!-- Delete button. -->
    {#if (
        // Show delete button if the Relationship is hovered, except those relating to Thing Forms.
        !($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag)
        && !$reorderingInfoStore.reorderInProgress
        && relationshipHovered
        && cohortMemberWithIndex.member
    )}
        <svg
            class="delete-button-container"
            x={leafGeometry.bottomMidline}
            y={leafGeometry.bottom}

            on:mouseenter={()=>{
                fanSegmentHovered = true
                thingIdOfHoveredRelationship = thing.id || null
            }}
            on:mouseleave={()=>{fanSegmentHovered = false; thingIdOfHoveredRelationship = null}}
        >
            <XButton
                size={20}
                buttonFunction={deleteRelationship}
            />
        </svg>
    {/if}

    <!-- Will-be-deleted indicator -->
    {#if !($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag) && willBeDeleted}
        <svg
            class="will-be-deleted-indicator"
            x={leafGeometry.bottomMidline}
            y={leafGeometry.bottom}
        >
            <line x1=2 y1=2 x2=18 y2=18 />
            <line x1=18 y1=2 x2=2 y2=18 />
        </svg>
    {/if}

</svg>


<style>
    .relationship-fan-segment {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .fan-segment-hover-zone {
        opacity: 0;

        pointer-events: auto;
        cursor: pointer;
    }

    .fan-segment-image {
        opacity: 0.05;
    }

    .fan-segment-image.soft-highlight {
        opacity: 0.1;
    }

    .fan-segment-image.hard-highlight {
        opacity: 0.25;
    }

    .delete-button-container {
        transform: translate(-10px, -10px);

        pointer-events: auto;
    }

    .will-be-deleted-indicator {
        transform: translate(-10px, -10px);
        stroke: red;
        stroke-width: 3px;
    }
</style>