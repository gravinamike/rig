<script context="module" lang="ts">
    import type { Thing, GenerationMember } from "$lib/models/graphModels"
    import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
    import { hoveredThingIdStore, storeGraphConstructs, addGraphIdsNeedingViewerRefresh, reorderingInfoStore, enableReordering, setReorderingTrackingMouse, setReorderingIndex, disableReordering } from "$lib/stores"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    import { reorderRelationship, updateRelationships } from "$lib/db/clientSide"
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

    $: isLastBranch = cohortMemberWithIndex.index === relationshipsWidgetModel.cohort.members.length - 1 ?
        true :
        false
    $: receivingRegionWidth = (
        relationshipsWidgetModel.graph.graphWidgetStyle.betweenThingSpacing
        + relationshipsWidgetModel.graph.graphWidgetStyle.thingSize
    )

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


    let dragStartPosition: [number, number] | null = null

    function handleMouseDown(event: MouseEvent) {
        const position = [event.clientX, event.clientY] as [number, number]
        dragStartPosition = position
        setReorderingTrackingMouse(true)
    }

    function handleMouseDrag(event: MouseEvent) {
        if (
            dragStartPosition
            && Math.hypot(event.clientX - dragStartPosition[0], event.clientX - dragStartPosition[0]) > 5
            && !$reorderingInfoStore.sourceThingId
            && relationshipsWidgetModel.cohort.parentThingId
            && relationshipsWidgetModel.cohort.address.directionId
            && cohortMemberWithIndex.member.thingId
        ) {
            enableReordering(
                relationshipsWidgetModel.cohort.parentThingId,
                relationshipsWidgetModel.cohort.address.directionId,
                cohortMemberWithIndex.member.thingId
            )
        }
    }

    function handleBodyMouseUp() {
        dragStartPosition = null
        disableReordering()
    }

    $: if (
        $reorderingInfoStore.sourceThingId
        && $reorderingInfoStore.destThingDirectionId
        && $reorderingInfoStore.destThingId
        && $reorderingInfoStore.newIndex
    ) {
        console.log("REQUEST")
        reorderRelationship(
            $reorderingInfoStore.sourceThingId,
            $reorderingInfoStore.destThingDirectionId,
            $reorderingInfoStore.destThingId,
            $reorderingInfoStore.newIndex
        )
        disableReordering()
    }
</script>


<svelte:body
    on:mousemove={handleMouseDrag}
    on:mouseup={ event => {
        leafClicked = false
        if (event.button === 0) handleBodyMouseUp()
    } }
/>


<!-- Reorder-receiving region(s). -->
{#if $reorderingInfoStore.sourceThingId}
    <div
        class="receiving-region"
        style="
            left: {
                leavesGeometries[cohortMemberWithIndex.index].topMidline - receivingRegionWidth
            }px;
            top: {
                leavesGeometries[cohortMemberWithIndex.index].top
            }px;
            width: {receivingRegionWidth}px;
            height: {leavesGeometries[cohortMemberWithIndex.index].bottom - leavesGeometries[cohortMemberWithIndex.index].top}px
        "
        on:mouseup={ () => {
            if (cohortMemberWithIndex.member.thing?.id) {
                setReorderingIndex(
                    cohortMemberWithIndex.index
                )
            }
        } }
    />

    {#if isLastBranch}
        <div
            class="receiving-region"
            style="
                left: {
                    leavesGeometries[cohortMemberWithIndex.index].topMidline
                }px;
                top: {
                    leavesGeometries[cohortMemberWithIndex.index].top
                }px;
                width: {
                    relationshipsWidgetModel.graph.graphWidgetStyle.betweenThingSpacing
                    + relationshipsWidgetModel.graph.graphWidgetStyle.thingSize
                }px;
                height: {leavesGeometries[cohortMemberWithIndex.index].bottom - leavesGeometries[cohortMemberWithIndex.index].top}px
            "
            on:mouseup={ () => {
                if (cohortMemberWithIndex.member.thing?.id) {
                setReorderingIndex(
                    cohortMemberWithIndex.index + 1
                )
            }
            } }
        />
    {/if}
{/if}

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
            on:mousedown={ (event)=>{
                leafClicked = true
                if (event.button === 0) handleMouseDown(event)
            } }
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

    <!-- Direction widget. -->
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

    .receiving-region {
        outline: solid 1px red;

        position: absolute;
        height: 100px;

        pointer-events: auto;
    }
</style>