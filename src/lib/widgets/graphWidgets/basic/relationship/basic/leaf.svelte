<script context="module" lang="ts">
    import type { Thing, GenerationMember } from "$lib/models/graphModels"
    import type { RelationshipWidgetModel } from "$lib/models/widgetModels"
    import { hoveredThingIdStore, storeGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    import { updateRelationships } from "$lib/db/clientSide"
</script>

<script lang="ts">

    export let relationshipWidgetModel: RelationshipWidgetModel
    export let thingIdOfHoveredRelationship: number | null
    export let tweenedScale: number

    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }

    $: thing = cohortMemberWithIndex.member as Thing
    let leafHovered = false
    $: thingHovered = thing.id === $hoveredThingIdStore
    $: relationshipHovered = thing.id === thingIdOfHoveredRelationship
    let leafClicked = false

    $: showDirection = leafHovered || relationshipHovered ? true : false

    async function changeRelationshipDirection(directionId: number) {
        const sourceThingId = thing.parentThing?.id || null
        const destThingId = thing.id || null

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
                await relationshipWidgetModel.relationshipCohortWidgetModel.graphWidgetModel.graph.build()
                addGraphIdsNeedingViewerRefresh(relationshipWidgetModel.relationshipCohortWidgetModel.graphWidgetModel.graph.id)
            }

        }
    }
</script>


<!-- Relationship leaf. -->
<div
    class="relationship-leaf"
    on:mouseenter={()=>{thingIdOfHoveredRelationship = thing.id || null}}
    on:mouseleave={()=>{thingIdOfHoveredRelationship = null}}
>
    <svg
        style="
            height: 100%; width: 100%;
            stroke: {relationshipWidgetModel.relationshipCohortWidgetModel.relationshipColor};
            fill: {relationshipWidgetModel.relationshipCohortWidgetModel.relationshipColor};
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
                    scaleY({relationshipWidgetModel.relationshipCohortWidgetModel.mirroring})
                    rotate({
                        -relationshipWidgetModel.relationshipCohortWidgetModel.rotation * relationshipWidgetModel.relationshipCohortWidgetModel.mirroring
                        + (
                            relationshipWidgetModel.relationshipCohortWidgetModel.halfAxisId === 3 ? -90 :
                            relationshipWidgetModel.relationshipCohortWidgetModel.halfAxisId === 4 ? 90 :
                            0
                        )
                    }deg);
            "
        >
            <DirectionWidget
                direction={relationshipWidgetModel.relationshipCohortWidgetModel.direction}
                halfAxisId={relationshipWidgetModel.relationshipCohortWidgetModel.halfAxisId}
                graphWidgetModel={relationshipWidgetModel.relationshipCohortWidgetModel.graphWidgetModel}
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