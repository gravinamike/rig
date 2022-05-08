<script context="module" lang="ts">
    import type { Thing } from "$lib/models/dbModels"
    import type { GenerationMember } from "$lib/models/graphModels"
    import { retrieveGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"
    import { XButton } from "$lib/widgets/layoutWidgets"
</script>

<script lang="ts">
    export let hoveredThingIdStoreValue: number | null
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let midline: number
    export let stemTop: number
    export let leavesGeometries: { bottom: number, top: number, bottomMidline: number, topMidline: number }[]
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }


    let fanSegmentHovered = false
    $: thingHovered = cohortMemberWithIndex.member.thingId === hoveredThingIdStoreValue
    $: relationshipHovered = cohortMemberWithIndex.member.thingId === thingIdOfHoveredRelationship
    let fanSegmentClicked = false

    async function deleteRelationship() {
        const graph = cohortMemberWithIndex.member.graph
        const sourceThingId = cohortMemberWithIndex.member.parentThingWidgetModel?.thingId || null
        const sourceThing = cohortMemberWithIndex.member.parentThingWidgetModel?.thing || null
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

        if (sourceThingId && destThingId) {
            await graph.deleteRelationshipByThingIds(sourceThingId, destThingId)
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }
</script>


<!-- Relationship fan segment. -->
<g
    class="relationship-fan-segment"
    style="z-index: 1;"
    on:mouseenter={()=>{thingIdOfHoveredRelationship = cohortMemberWithIndex.member.thingId}}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>    
    <!-- Hoverable zone of fan segment. -->
    <line
        class="fan-segment-hover-zone"
        x1="{midline}" y1="{stemTop}"
        x2="{leavesGeometries[cohortMemberWithIndex.index].bottomMidline}" y2="{leavesGeometries[cohortMemberWithIndex.index].bottom}"
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
        x2="{leavesGeometries[cohortMemberWithIndex.index].bottomMidline}" y2="{leavesGeometries[cohortMemberWithIndex.index].bottom}"
    />

    <!-- Delete button. -->
    {#if relationshipHovered}
        <svg
            class="delete-button-container"
            style="
                transform: translate(-10px, -10px);
                pointer-events: auto;
            "
            x={leavesGeometries[cohortMemberWithIndex.index].bottomMidline}
            y={leavesGeometries[cohortMemberWithIndex.index].bottom}
            on:mouseenter={()=>{fanSegmentHovered = true; thingIdOfHoveredRelationship = cohortMemberWithIndex.member.thingId}}
            on:mouseleave={()=>{fanSegmentHovered = false; thingIdOfHoveredRelationship = null}}
        >
            <XButton
                size={20}
                buttonFunction={deleteRelationship}
            />
        </svg>
    {/if}
</g>


<style>
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
</style>