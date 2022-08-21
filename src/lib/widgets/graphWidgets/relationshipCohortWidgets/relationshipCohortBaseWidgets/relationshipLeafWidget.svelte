<script context="module" lang="ts">
    import type { Thing, GenerationMember } from "$lib/models/graphModels"
    import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
    import { hoveredThingIdStore, storeGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    import { updateRelationships } from "$lib/db/clientSide"
</script>

<script lang="ts">

    export let relationshipsWidgetModel: RelationshipCohortWidgetModel
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }


    let leafHovered = false
    $: thingHovered = cohortMemberWithIndex.member.thingId === $hoveredThingIdStore
    $: relationshipHovered = cohortMemberWithIndex.member.thingId === thingIdOfHoveredRelationship
    let leafClicked = false

    $: showDirection = leafHovered || relationshipHovered ? true : false

    async function changeRelationshipDirection(directionId: number) {
        const sourceThingId = cohortMemberWithIndex.member.parentThingWidgetModel?.thingId || null
        const destThingId = cohortMemberWithIndex.member.thingId

        if (sourceThingId && destThingId && directionId) {
            const relationshipsUpdated = await updateRelationships([
                {
                    sourceThingId: sourceThingId,
                    destThingId: destThingId,
                    directionId: directionId
                }
            ])
            if (relationshipsUpdated) {
                await storeGraphConstructs<Thing>("Thing", sourceThingId, true)
                await relationshipsWidgetModel.graph.build()
                addGraphIdsNeedingViewerRefresh(relationshipsWidgetModel.graph.id)
            }

        }
    }
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
        x1="{leafGeometry.bottomMidline}" y1="{leafGeometry.bottom}"
        x2="{leafGeometry.topMidline}" y2="{leafGeometry.top}"
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
        x1="{leafGeometry.bottomMidline}" y1="{leafGeometry.bottom}"
        x2="{leafGeometry.topMidline}" y2="{leafGeometry.top}"
    />

    </svg>

    <!-- Direction widget. -->
    {#if showDirection}
        <div
            class="direction-widget-anchor"
            style="
                left: {
                    (
                        leafGeometry.bottomMidline
                        + leafGeometry.topMidline
                        - 3 / tweenedScale
                    ) / 2
                }px;
                top: {
                    (
                        leafGeometry.bottom
                        + leafGeometry.top
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
                optionClickedFunction={(direction, _, __) => {
                    if (direction?.id) changeRelationshipDirection(direction.id)
                }}
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