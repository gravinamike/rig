<script context="module" lang="ts">
    import type { GenerationMember } from "$lib/models/graphModels"
</script>

<script lang="ts">
    export let hoveredThingIdStoreValue: number | null
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let leavesGeometries: { bottom: number, top: number, bottomMidline: number, topMidline: number }[]
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }


    let leafHovered = false
    $: thingHovered = cohortMemberWithIndex.member.thingId === hoveredThingIdStoreValue
    $: relationshipHovered = cohortMemberWithIndex.member.thingId === thingIdOfHoveredRelationship
    let leafClicked = false
</script>


<!-- Relationship leaf. -->
<g
    class="relationship-leaf"
    on:mouseenter={()=>{thingIdOfHoveredRelationship = cohortMemberWithIndex.member.thingId}}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>
    <!-- Hoverable zone of leaf. -->
    <line
        class="leaf-hover-zone"
        x1="{leavesGeometries[cohortMemberWithIndex.index].bottomMidline}" y1="{leavesGeometries[cohortMemberWithIndex.index].bottom}"
        x2="{leavesGeometries[cohortMemberWithIndex.index].topMidline}" y2="{leavesGeometries[cohortMemberWithIndex.index].top}"
        style="stroke-width: {8 / tweenedScale};"
        on:mouseenter={()=>{leafHovered = true}}
        on:mouseleave={()=>{leafHovered = false}}
        on:mousedown={()=>{leafClicked = true}}
        on:mouseup={()=>{leafClicked = false}}
    />

    <!-- Visual image of leaf. -->
    <line
        class="
            leaf-image
            {leafHovered || relationshipHovered || thingHovered ? "hovered" : ""}
            {leafClicked ? "clicked" : ""}
        "
        style="stroke-width: {3 / tweenedScale};"
        x1="{leavesGeometries[cohortMemberWithIndex.index].bottomMidline}" y1="{leavesGeometries[cohortMemberWithIndex.index].bottom}"
        x2="{leavesGeometries[cohortMemberWithIndex.index].topMidline}" y2="{leavesGeometries[cohortMemberWithIndex.index].top}"
    />
</g>


<style>
    .leaf-hover-zone {
        opacity: 0;

        pointer-events: auto;
        cursor: pointer;
    }

    .leaf-image {
        opacity: 0.25;
    }

    .leaf-image.hovered {
        opacity: 0.5;
    }

    .leaf-image.clicked {
        opacity: 1;
    }
</style>