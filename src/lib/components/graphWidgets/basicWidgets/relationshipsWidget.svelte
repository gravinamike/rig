<script context="module" lang="ts">
    import type { Direction, Space } from "$lib/shared/graph/graphDbConstructs"
    import type { GenerationMember, Cohort, Graph } from "$lib/shared/graph/graph"
    import { rotationByHalfAxisId, offsetsByHalfAxisId } from "$lib/shared/constants"
    import { retrieveGraphConstructs } from "$lib/shared/stores/graphStores"
</script>

<script lang="ts">
    export let cohort: Cohort
    export let space: Space
    export let graph: Graph

    $: offsetLength = graph.graphWidgetStyle.offsetLength
    $: thingSize = graph.graphWidgetStyle.thingSize
    $: betweenThingGap = graph.graphWidgetStyle.betweenThingGap

    $: edgeToEdgeDimension = offsetLength - thingSize

    const cohortMembersWithIndices: { index: number, member: GenerationMember }[] = []
    cohort.members.forEach(function (member, index) {
        cohortMembersWithIndices.push({ index: index, member: member })
    })
    $: childrenDimension = cohort.members.length * thingSize + (cohort.members.length - 1) * betweenThingGap

    // Calculate x and y offsets and z-index relative to parent Thing Widget.
    const generationId = cohort.address?.generationId || 0
    const halfAxisId = cohort.address ? cohort.address.halfAxisId : 0
    const offsetSigns = offsetsByHalfAxisId[halfAxisId]
    $: offsets = [ 0.5 * offsetLength * offsetSigns[0], 0.5 * offsetLength * offsetSigns[1] ]
    $: zIndex = (generationId * 2 - 1) * offsetSigns[2]

    // Calculate width and height.
    $: widgetHeight = [1, 2].includes(halfAxisId) ? edgeToEdgeDimension : childrenDimension
    $: widgetWidth = [3, 4].includes(halfAxisId) ? edgeToEdgeDimension : childrenDimension
    $: imageHeight = edgeToEdgeDimension
    $: imageWidth = childrenDimension

    // Calculate rotation of Relationship image.
    const rotation = rotationByHalfAxisId[halfAxisId]

    // Retrieve Direction information.
    const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
    const direction = retrieveGraphConstructs("Direction", directionId) as Direction
</script>


<main class="relationships-widget" style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); z-index: {zIndex}; width: {widgetWidth}px; height: {widgetHeight}px;">
    <div class="direction-text" style="font-size: {graph.graphWidgetStyle.relationshipTextSize}px">
        {direction.text}
    </div>
    <svg class="relationship-image" style="width: {imageWidth}px; height: {imageHeight}px; transform: rotate({rotation}deg);">
        <line style="stroke-width: 6; cursor: pointer;"
            x1="{childrenDimension * 0.5}" y1="{edgeToEdgeDimension}"
            x2="{childrenDimension * 0.5}" y2="{edgeToEdgeDimension * 2 / 3 + 6}"
        />
        <polygon style="cursor: pointer;"
            points="{childrenDimension * 0.5 - 3},{edgeToEdgeDimension * 2 / 3 + 6} {childrenDimension * 0.5 + 3},{edgeToEdgeDimension * 2 / 3 + 6} {childrenDimension * 0.5},{edgeToEdgeDimension * 2 / 3}"
        />
        {#each cohortMembersWithIndices as memberWithIndex}
            <line style="stroke-dasharray: 1 5;"
                x1="{childrenDimension * 0.5}" y1="{edgeToEdgeDimension * 2 / 3}"
                x2="{thingSize * 0.5 + (thingSize + betweenThingGap) * memberWithIndex.index}" y2="{edgeToEdgeDimension * 1 / 3}"
            />
            <line style="stroke-width: 2;"
                x1="{thingSize * 0.5 + (thingSize + betweenThingGap) * memberWithIndex.index}" y1="{edgeToEdgeDimension * 1 / 3}"
                x2="{thingSize * 0.5 + (thingSize + betweenThingGap) * memberWithIndex.index}" y2="0"
            />
        {/each}
    </svg> 
</main>


<style>
    main {
        position: absolute;
        transform: translate(-50%, -50%);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    main:hover {
        border-radius: 5px;
        outline: dashed 1px lightgrey;
    }

    .relationship-image {
        position: absolute;
        stroke:lightgrey;
    }
    
    .relationship-image polygon {
        stroke-width: 3;
        fill:lightgrey;
    }
</style>