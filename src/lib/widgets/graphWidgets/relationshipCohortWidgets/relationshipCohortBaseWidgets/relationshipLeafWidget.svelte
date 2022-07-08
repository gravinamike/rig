<script context="module" lang="ts">
    import type { GenerationMember } from "$lib/models/graphModels"
    import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
    import { hoveredThingIdStore } from "$lib/stores"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
</script>

<script lang="ts">
    export let relationshipsWidgetModel: RelationshipCohortWidgetModel
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let leavesGeometries: { bottom: number, top: number, bottomMidline: number, topMidline: number }[]
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }


    let leafHovered = false
    $: thingHovered = cohortMemberWithIndex.member.thingId === $hoveredThingIdStore
    $: relationshipHovered = cohortMemberWithIndex.member.thingId === thingIdOfHoveredRelationship
    let leafClicked = false

    $: showDirection = leafHovered || relationshipHovered ? true : false
</script>


<!-- Relationship leaf. -->
<div
    class="relationship-leaf"
    on:mouseenter={()=>{thingIdOfHoveredRelationship = cohortMemberWithIndex.member.thingId}}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>
    <svg
        style="
            height: 100%; width: 100%;
            stroke: {relationshipsWidgetModel.relationshipColor};
            fill: {relationshipsWidgetModel.relationshipColor};
        "
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

    </svg>

    <!-- Direction text. -->
    {#if showDirection}
        <div
            class="direction-widget-anchor"
            style="
                left: {
                    (
                        leavesGeometries[cohortMemberWithIndex.index].bottomMidline
                        + leavesGeometries[cohortMemberWithIndex.index].topMidline
                        - 3 / tweenedScale
                    ) / 2
                }px;
                top: {
                    (
                        leavesGeometries[cohortMemberWithIndex.index].bottom
                        + leavesGeometries[cohortMemberWithIndex.index].top
                    ) / 2
                }px;
                transform-origin: calc(right - {1.5 / tweenedScale}px) 50%;
                transform:
                    translate(-100%, -50%)
                    scaleY({relationshipsWidgetModel.mirroring})
                    rotate({
                        -relationshipsWidgetModel.rotation * relationshipsWidgetModel.mirroring
                        + (
                            relationshipsWidgetModel.halfAxisId === 3 ? -90 :
                            relationshipsWidgetModel.halfAxisId === 4 ? 90 :
                            0
                        )
                    }deg);
            "
        >
            <DirectionWidget
                direction={relationshipsWidgetModel.direction}
                halfAxisId={relationshipsWidgetModel.halfAxisId}
                graph={relationshipsWidgetModel.graph}
                optionClickedFunction={(direction, _, option) => {console.log(direction, option)}}
            />
        </div>
    {/if}
</div>


<style>
    .relationship-leaf {
        position: absolute;
        width: 100%;
        height: 100%;
    }

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

    .direction-widget-anchor {
        position: absolute;
        z-index: 2;
    }
</style>