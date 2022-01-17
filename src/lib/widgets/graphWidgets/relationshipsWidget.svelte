<script context="module" lang="ts">
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
    import type { Graph, Cohort, GenerationMember } from "$lib/models/graphModels"
    import type { Direction, Space } from "$lib/models/dbModels"

    import { rotationByHalfAxisId, offsetsByHalfAxisId, zoomBase } from "$lib/shared/constants"
    import { retrieveGraphConstructs } from "$lib/stores/graphStores"
    import { ThingWidgetModel } from "$lib/models/widgetModels"
    import { sleep } from "$lib/shared/utility"
</script>

<script lang="ts">
    export let cohort: Cohort
    export let space: Space
    export let graph: Graph

    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    $: offsetLength = graph.graphWidgetStyle.offsetLength
    $: thingSize = graph.graphWidgetStyle.thingSize
    $: betweenThingGap = 0.01 * graph.graphWidgetStyle.thingSpacingPercent * graph.graphWidgetStyle.thingSize

    $: edgeToEdgeDimension = offsetLength - thingSize

    let cohortMembersWithIndices: { index: number, member: GenerationMember }[] = []
    function updateCohortMembersWithIndices(members: GenerationMember[]) {
        cohortMembersWithIndices = []
        members.forEach(
            (member, index) => cohortMembersWithIndices.push({ index: index, member: member })
        )
    }
    $: updateCohortMembersWithIndices(cohort.members)
    
    $: childrenDimension = Math.max(cohort.members.length, 1) * thingSize + (cohort.members.length - 1) * betweenThingGap

    // Calculate x and y offsets and z-index relative to parent Thing Widget.
    const generationId = cohort.address?.generationId || 0
    const halfAxisId = cohort.address && cohort.address.halfAxisId ? cohort.address.halfAxisId : 0
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

    // Calculate opacity.
    $: planeId = cohort?.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    $: opacity = 1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))

    // Retrieve Direction information.
    const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
    const direction = retrieveGraphConstructs("Direction", directionId) as Direction


    async function addThingForm() {
        const newThingWidgetModel = new ThingWidgetModel(null)
        if (!graph.formActive) {
            cohort.addMember(newThingWidgetModel)
            graph.formActive = true
        }
        graph = graph
        await sleep(50)// Allow the Thing Form Widget to render.
        const thingFormTextField = document.getElementById("thing-form-text-field")//// Instead find the ThingForm, and access the field as a property.
        thingFormTextField?.focus()
    }
</script>


<main class="relationships-widget" style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); z-index: {zIndex}; width: {widgetWidth}px; height: {widgetHeight}px; opacity: {opacity};">
    <div
        class="direction-text {!cohort.members.length ? "empty" : ""}"
        style="font-size: {graph.graphWidgetStyle.relationshipTextSize}px"
    >
        {direction.text}
    </div>
    <svg
        class="relationship-image {!cohort.members.length ? "empty" : ""}"
        style="width: {imageWidth}px; height: {imageHeight}px; transform: rotate({rotation}deg);"
    >
        <g
            class="relationship-stem"
            on:click={addThingForm}
        >
            <line
                x1="{childrenDimension * 0.5}" y1="{edgeToEdgeDimension}"
                x2="{childrenDimension * 0.5}" y2="{edgeToEdgeDimension * 2 / 3 + 6 / $tweenedScale}"
                style="stroke-width: {10 / $tweenedScale};"
            />
            <polygon
                points="{childrenDimension * 0.5 - 5 / $tweenedScale},{edgeToEdgeDimension * 2 / 3 + 8 / $tweenedScale} {childrenDimension * 0.5 + 5 / $tweenedScale},{edgeToEdgeDimension * 2 / 3 + 8 / $tweenedScale} {childrenDimension * 0.5},{edgeToEdgeDimension * 2 / 3}"
                style="stroke-width: {3 / $tweenedScale};"
            />
        </g>
        {#each cohortMembersWithIndices as memberWithIndex}
            <line style="stroke-width: {2 / $tweenedScale}; stroke-dasharray: {1 / $tweenedScale} {5 / $tweenedScale};"
                x1="{childrenDimension * 0.5}" y1="{edgeToEdgeDimension * 2 / 3}"
                x2="{thingSize * 0.5 + (thingSize + betweenThingGap) * memberWithIndex.index}" y2="{edgeToEdgeDimension * 1 / 3}"
            />
            <line style="stroke-width: {2 / $tweenedScale};"
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
        stroke: lightgrey;
        fill: lightgrey;
    }

    .relationships-widget:active {
        pointer-events: none;
    }

    main:not(:hover) .empty {
        visibility: hidden;
    }

    .direction-text, svg {
        pointer-events: auto;
    }

    .relationship-stem {        
        cursor: pointer;
    }

    .relationship-stem:hover {
        stroke: silver;
        fill: silver;
    }

    .relationship-stem:active {
        stroke: dimgrey;
        fill: dimgrey;
    }
</style>