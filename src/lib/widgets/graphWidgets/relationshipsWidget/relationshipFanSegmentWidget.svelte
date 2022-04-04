<script context="module" lang="ts">
    import type { GenerationMember } from "$lib/models/graphModels"
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
</script>


<!-- Relationship fan segment. -->
<g
    class="relationship-fan-segment"
>    
    <!-- Hoverable zone of fan segment. -->
    <line
        class="fan-segment-hover-zone"
        x1="{midline}" y1="{stemTop}"
        x2="{leavesGeometries[cohortMemberWithIndex.index].bottomMidline}" y2="{leavesGeometries[cohortMemberWithIndex.index].bottom}"
        style="stroke-width: {5 / tweenedScale};"
        on:mouseenter={()=>{fanSegmentHovered = true; thingIdOfHoveredRelationship = cohortMemberWithIndex.member.thingId}}
        on:mouseleave={()=>{fanSegmentHovered = false; thingIdOfHoveredRelationship = null}}
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