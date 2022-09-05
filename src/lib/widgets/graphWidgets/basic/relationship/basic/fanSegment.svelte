<script context="module" lang="ts">
    import type { Thing, GenerationMember } from "$lib/models/graphModels"
    import type { RelationshipWidgetModel } from "$lib/models/widgetModels"
    import { retrieveGraphConstructs, addGraphIdsNeedingViewerRefresh, relationshipBeingCreatedInfoStore, hoveredThingIdStore, hoveredRelationshipTarget } from "$lib/stores"
    import { XButton } from "$lib/widgets/layoutWidgets"
</script>

<script lang="ts">
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let relationshipWidgetModel: RelationshipWidgetModel
    export let midline: number
    export let stemTop: number
    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }


    let fanSegmentHovered = false
    $: thing = cohortMemberWithIndex.member as Thing
    $: thingHovered = thing.id === $hoveredThingIdStore
    $: relationshipHovered = thing.id === thingIdOfHoveredRelationship
    let fanSegmentClicked = false

    async function deleteRelationship() {
        const graph = (cohortMemberWithIndex.member as Thing).graph
        const sourceThingId = thing.parentThing?.id || null
        const sourceThing = thing?.parentThing || null
        const destThingId = thingIdOfHoveredRelationship
        const destThing = thingIdOfHoveredRelationship ?
            retrieveGraphConstructs("Thing", thingIdOfHoveredRelationship) as Thing :
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
    $: dragSourceThingId = $relationshipBeingCreatedInfoStore.sourceWidgetModel ?
        (
            $relationshipBeingCreatedInfoStore.sourceWidgetModel.kind === "thingWidgetModel" ?
                $relationshipBeingCreatedInfoStore.sourceWidgetModel.thingId as number :
                $relationshipBeingCreatedInfoStore.sourceWidgetModel.parentThingWidgetModel.thingId as number
        ) :
        null
    $: dragDestThingId = $hoveredRelationshipTarget ?
        (
            $hoveredRelationshipTarget.kind === "thingWidgetModel" ?
                $hoveredRelationshipTarget.thingId as number :
                $hoveredRelationshipTarget.parentThingWidgetModel.thingId as number
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
</script>


<!-- Relationship fan segment. -->
<svg
    class="relationship-fan-segment"
    style="
        stroke: {relationshipWidgetModel.relationshipCohortWidgetModel.relationshipColor};
        fill: {relationshipWidgetModel.relationshipCohortWidgetModel.relationshipColor};
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
        class="
            fan-segment-image
            {fanSegmentHovered || relationshipHovered || thingHovered ? "hovered" : ""}
            {fanSegmentClicked ? "clicked" : ""}
        "
        style="stroke-width: {3 / tweenedScale};"
        x1="{midline}" y1="{stemTop}"
        x2="{leafGeometry.bottomMidline}" y2="{leafGeometry.bottom}"
    />

    <!-- Delete button. -->
    {#if (
        // Show delete button if the Relationship is hovered, except those relating to Thing Forms.
        relationshipHovered
        && cohortMemberWithIndex.member
    )}
        <svg
            class="delete-button-container"
            style="
                transform: translate(-10px, -10px);
                pointer-events: auto;
            "
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
    {#if willBeDeleted}
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

    .fan-segment-image.hovered {
        opacity: 0.1;
    }

    .fan-segment-image.clicked {
        opacity: 0.25;
    }

    .will-be-deleted-indicator {
        transform: translate(-10px, -10px);
        stroke: red;
        stroke-width: 3px;
    }
</style>