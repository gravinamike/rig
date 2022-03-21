<script context="module" lang="ts">
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
    import type { Graph, Cohort, GenerationMember } from "$lib/models/graphModels"
    import type { Direction, Space } from "$lib/models/dbModels"

    import { rotationByHalfAxisId, mirroringByHalfAxisId, relationshipColorByHalfAxisId, offsetsByHalfAxisId, zoomBase } from "$lib/shared/constants"
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

    $: edgeToEdgeDimension = offsetLength - thingSize * cohort.axialElongation

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





    $: rowOrColumn = [3, 4, 5, 6, 7, 8].includes(halfAxisId) ? "column" : "row"

    $: grandparentThingId = cohort.parentCohort()?.address.parentThingWidgetModel?.thingId || null
    $: indexOfGrandparentThing = grandparentThingId !== null ? 
        cohort.members.findIndex( member => member.thingId === grandparentThingId )
        : null
    $: offsetToGrandparentThing = indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1 ?
        ((cohort.members.length - 1)/2 - indexOfGrandparentThing) * (thingSize + betweenThingGap) :
        0
    $: offsetToGrandparentThingX = rowOrColumn === "row" ? offsetToGrandparentThing : 0
    $: offsetToGrandparentThingY = rowOrColumn === "column" ? offsetToGrandparentThing : 0

    




    function rectOfThingWidgetByThingId(thingId: number): DOMRect | null {//////////// Move to graph?
        const thingWidget = document.getElementById(`graph#${graph.id}-thing#${thingId}`)
        return thingWidget ? thingWidget.getBoundingClientRect() : null
    }

    
    $: parentThingId = cohort.address.parentThingWidgetModel?.thingId || null
    let parentDomRect: DOMRect | null
    $: {
        $tweenedScale
        parentDomRect = parentThingId ?
            rectOfThingWidgetByThingId(parentThingId) :
            null
    }
    $: cohortDomRects = cohortMembersWithIndices.map(
        memberWithIndex => memberWithIndex.member.thingId ?
            rectOfThingWidgetByThingId(memberWithIndex.member.thingId) :
            null
    )

    function leafOffsetByIndex(index: number): number {
        const parentRectX = parentDomRect ? parentDomRect.x : 0
        const relatedRect = cohortDomRects[index]
        const relatedRectX = relatedRect ? relatedRect.x : 0
        const offsetLength = (relatedRectX - parentRectX) / $tweenedScale
        const offsetSignForHalfAxis = [3, 4].includes(halfAxisId) ? -offsetSigns[0] : -offsetSigns[1]
        return offsetLength * offsetSignForHalfAxis
    }
    ///////////////////////////////////////// HAVE TO USE Y COORD, AND HAVE TO ADD/SUBTRACT BASED ON ROTATION.
    ///////////////////////////////////////// THEN COLOR THE AXES TO DISTINGUISH THEM.













    // Calculate Relationship image dimensions.
    $: midline = childrenDimension * 0.5 - offsetToGrandparentThing
    $: leavesMidlines = cohortMembersWithIndices.map(
        memberWithIndex => memberWithIndex.member.kind === "thingBaseWidgetModel" ? 
        //(memberWithIndex) => true ? /////////////////////////////// Use this conditional to distinguish the Relationships to Things that already exist in the Graph.
            thingSize * 0.5 + leafOffsetByIndex(memberWithIndex.index) :
            thingSize * 0.5 + (thingSize + betweenThingGap) * memberWithIndex.index
    )
    $: stemBottom = edgeToEdgeDimension
    $: stemTop = edgeToEdgeDimension * 2/3
    $: leavesBottom = edgeToEdgeDimension * 1/3
    $: leavesTop = 0

    // Calculate rotation and mirroring of Relationship image.
    const rotation = rotationByHalfAxisId[halfAxisId]
    const mirroring = mirroringByHalfAxisId[halfAxisId]

    // Calculate color of Relationship image.
    const relationshipColor = relationshipColorByHalfAxisId[halfAxisId]

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


<!-- Outer Relationships Widget (doesn't rotate, but takes up appropriate dimensions). -->
<div
    class="relationships-widget"
    style="
        left: calc({offsets[0]}px + 50% + {offsetToGrandparentThingX}px);
        top: calc({offsets[1]}px + 50% + {offsetToGrandparentThingY}px);
        z-index: {zIndex};
        width: {widgetWidth}px;
        height: {widgetHeight}px;
        opacity: {opacity};
    "
>
    <!-- Inner "rotator" which is rotated according to the Half-Axis. -->
    <div
        class="rotator"
        style="transform: scaleY({mirroring}) rotate({rotation * mirroring}deg); "
    >

        <!-- Direction text. -->
        {#if !(indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}
            <div
                class="direction-text {!cohort.members.length ? "empty" : ""}"
                style="
                    transform: scaleY({mirroring}) rotate({-rotation * mirroring + (halfAxisId === 3 ? -90 : (halfAxisId === 4 ? 90 : 0))}deg);
                    font-size: {graph.graphWidgetStyle.relationshipTextSize}px; color: {relationshipColor}
                "
            >
                {direction.text}
            </div>
        {/if}

        <!-- Relationship image. -->
        <svg
            class="relationship-image {!cohort.members.length ? "empty" : ""}"
            style="width: {imageWidth}px; height: {imageHeight}px; stroke: {relationshipColor}; fill: {relationshipColor};"
        >
            <!-- Relationship stem. -->
            {#if !(indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}
                <g
                    class="relationship-stem"
                    on:click={addThingForm}
                >
                    <line
                        x1="{midline}" y1="{stemBottom}"
                        x2="{midline}" y2="{stemTop + 6 / $tweenedScale}"
                        style="stroke-width: {10 / $tweenedScale};"
                    />
                    <polygon
                        points="
                            {midline - 5 / $tweenedScale}, {stemTop + 8 / $tweenedScale}
                            {midline + 5 / $tweenedScale}, {stemTop + 8 / $tweenedScale}
                            {midline}, {stemTop}
                        "
                        style="stroke-width: {3 / $tweenedScale};"
                    />
                </g>
            {/if}

            {#if !(cohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
                {#each cohortMembersWithIndices as memberWithIndex}
                    {#if indexOfGrandparentThing !== memberWithIndex.index}<!-- Don't re-draw the existing Relationship to a parent Thing. -->
                        <!-- Relationship fan. -->
                        <line 
                            class="relationship-fan"
                            style="
                                stroke-width: {2 / $tweenedScale};
                                stroke-dasharray: {1 / $tweenedScale} {5 / $tweenedScale};
                            "
                            x1="{midline}" y1="{stemTop}"
                            x2="{leavesMidlines[memberWithIndex.index]}" y2="{leavesBottom}"
                        />

                        <!-- Relationship leaves. -->
                        <line
                            class="relationship-leaves"
                            style="stroke-width: {2 / $tweenedScale};"
                            x1="{leavesMidlines[memberWithIndex.index]}" y1="{leavesBottom}"
                            x2="{leavesMidlines[memberWithIndex.index]}" y2="{leavesTop}"
                        />
                    {/if}
                {/each}
            {/if}
        </svg>

    </div>
</div>


<style>
    .relationships-widget {
        position: absolute;
        transform: translate(-50%, -50%);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .relationships-widget:hover {
        border-radius: 5px;
        outline: dashed 1px lightgrey;
    }

    .relationships-widget:active {
        pointer-events: none;
    }

    .relationships-widget:not(:hover) .empty {
        visibility: hidden;
    }

    .rotator {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .direction-text {
        border-radius: 8px;

        background-color: white;

        padding: 0.25rem;

        pointer-events: auto;
    }

    .relationship-image {
        position: absolute;

        overflow: visible;

        pointer-events: auto;
    }

    .relationship-stem {
        opacity: 0.25;

        cursor: pointer;
    }

    .relationship-stem:hover {
        opacity: 0.5;
    }

    .relationship-stem:active {
        opacity: 1.0;
    }

    .relationship-fan {
        opacity: 0.15;
    }

    .relationship-leaves {
        opacity: 0.25;
    }
</style>