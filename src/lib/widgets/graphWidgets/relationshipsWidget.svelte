<script context="module" lang="ts">
    // Type imports.
    import type { Direction, Space } from "$lib/models/dbModels"
    import type { Graph, GenerationMember, Cohort } from "$lib/models/graphModels"

    // Stores imports.
    import { hoveredThingIdStore } from "$lib/stores"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import {
        rotationByHalfAxisId, mirroringByHalfAxisId, offsetsByHalfAxisId,
        relationshipColorByHalfAxisId,
        zoomBase
    } from "$lib/shared/constants"
    import { sleep } from "$lib/shared/utility"
    import { getCohortMembersWithIndices, rectOfThingWidgetByThingId } from "./utility"

    // Stores imports.
    import { retrieveGraphConstructs } from "$lib/stores/graphStores"

    // Model imports.
    import { ThingWidgetModel } from "$lib/models/widgetModels"
</script>

<script lang="ts">
    export let cohort: Cohort
    export let space: Space
    export let graph: Graph



    let hoveredThingIdStoreValue: number | null = null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    let relationshipHovered = false
    let thingIdOfHoveredRelationship: number | null = null

    /* Basic Widget information. */
    
    // Information related to the Relationships Widget's place in the Graph.
    const parentThingWidgetModel = cohort.address.parentThingWidgetModel as ThingWidgetModel
    const generationId = cohort.address?.generationId || 0
    const halfAxisId = cohort.address && cohort.address.halfAxisId ? cohort.address.halfAxisId : 0
    

    // Graph-scale-related variables.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    // Information related to Direction.
    const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
    const direction = retrieveGraphConstructs("Direction", directionId) as Direction
    $: showDirection = parentThingWidgetModel.address.generationId === 0 || relationshipHovered ?
        true :
        false



    /* Variables related to whole-Widget geometry. */

    // Variables related to the geometry of Graph construct widgets.
    $: relationDistance = graph.graphWidgetStyle.relationDistance // The center-to-center distance between two related Things.
    $: thingSize = graph.graphWidgetStyle.thingSize



    
    $: cohortSize = parentThingWidgetModel.cohortSize
    $: xYElongation = parentThingWidgetModel.xYElongation
    $: encapsulatingDepth = parentThingWidgetModel.encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2




    $: betweenThingSpacing = graph.graphWidgetStyle.betweenThingSpacing

    // Variables related to the x, y, and z position of this Relationships Widget (relative to parent Thing Widget).
    const offsetSigns = offsetsByHalfAxisId[halfAxisId]
    $: xOffset = 0.5 * relationDistance * offsetSigns[0]
    $: yOffset = 0.5 * relationDistance * offsetSigns[1]
    const zIndex = (generationId * 2 - 1) * offsetSigns[2]
    
    // Variables related to the widths and heights of this Relationships Widget.
    $: relationshipsWidth = Math.max(cohort.members.length, 1) * ([1, 2].includes(halfAxisId) ? thingWidth : thingHeight) + (cohort.members.length - 1) * betweenThingSpacing // The width across all the Relationships in the widget.
    $: relationshipsLength = relationDistance - ([1, 2].includes(halfAxisId) ? thingHeight : thingWidth) * cohort.axialElongation // The edge-to-edge distance between two related Things.
    $: widgetWidth = [1, 2].includes(halfAxisId) ? relationshipsWidth : relationshipsLength
    $: widgetHeight = [1, 2].includes(halfAxisId) ? relationshipsLength : relationshipsWidth

    // Variables related to rotation and mirroring of Relationship image.
    const rotation = rotationByHalfAxisId[halfAxisId]
    const mirroring = mirroringByHalfAxisId[halfAxisId]


    /* Variables related to the geometries of the Widget's parts. */

    // X and Y offsets to grandparent Thing.
    // This means the distance from left and top edge of the Relationships Widget to the midline of the
    // Thing Widget that would duplicate, or "double back", the grandparent Thing.
    // If the grandparent Thing is not in the related Cohort, the offsets are 0.
    $: offsetToGrandparentThing = cohort.indexOfGrandparentThing !== null ?
        ((cohort.members.length - 1)/2 - cohort.indexOfGrandparentThing) * (([1, 2].includes(halfAxisId) ? thingWidth : thingHeight) + betweenThingSpacing) :
        0
    $: xOffsetToGrandparentThing = cohort.rowOrColumn() === "row" ? offsetToGrandparentThing : 0
    $: yOffsetToGrandparentThing = cohort.rowOrColumn() === "column" ? offsetToGrandparentThing : 0

    















    // Construct a list of the related Things along with their indices.
    $: cohortMembersWithIndices = getCohortMembersWithIndices(cohort.members)


    function leafOffsetsByIndex(member: GenerationMember): {x: number, y: number} {
        // Get location of parent Thing Widget.
        const parentDomRect = rectOfThingWidgetByThingId(graph.id, cohort.parentThingId as number)
        const parentRectX = parentDomRect === null ? 0 : parentDomRect.x
        const parentRectY = parentDomRect === null ? 0 : parentDomRect.y

        // Get posisition of related Thing Widget.
        const relatedRect = rectOfThingWidgetByThingId(graph.id, member.thingId as number)
        const relatedRectX = relatedRect === null ? 0 : relatedRect.x
        const relatedRectY = relatedRect === null ? 0 : relatedRect.y

        // Get the offset (the difference between the two).
        const offsetLengthX = (relatedRectX - parentRectX) / $tweenedScale
        const offsetLengthY = (relatedRectY - parentRectY) / $tweenedScale
        
        return {x: offsetLengthX, y: offsetLengthY}
    }



    $: midline = relationshipsWidth * 0.5 - offsetToGrandparentThing
    $: stemBottom = relationshipsLength
    $: stemTop = relationshipsLength * 2/3


    let leavesBottoms: number[]
    $: {
        $tweenedScale
        leavesBottoms = cohortMembersWithIndices.map(
            memberWithIndex => memberWithIndex.member.kind === "thingBaseWidgetModel" ?

                relationshipsLength + (([1, 2].includes(halfAxisId) ? thingHeight : thingWidth) * 0.5) + (
                    [1, 2].includes(halfAxisId) ?
                        leafOffsetsByIndex(memberWithIndex.member).y :
                        leafOffsetsByIndex(memberWithIndex.member).x
                ) * 0.5 * (
                    [1, 2].includes(halfAxisId) ?
                        mirroring :
                        -mirroring
                ) :

                relationshipsLength * 1/3
        )
    }


    let leavesTops: number[]
    $: {
        $tweenedScale
        leavesTops = cohortMembersWithIndices.map(
            memberWithIndex => memberWithIndex.member.kind === "thingBaseWidgetModel" ?
                relationshipsLength + (([1, 2].includes(halfAxisId) ? thingHeight : thingWidth) * 0.5) + (
                    [1, 2].includes(halfAxisId) ?
                        leafOffsetsByIndex(memberWithIndex.member).y :
                        leafOffsetsByIndex(memberWithIndex.member).x
                ) * 0.5 * (
                    [1, 2].includes(halfAxisId) ?
                        mirroring :
                        -mirroring
                ) :
                0
        )
    }

                






    let leavesBottomMidlines: number[]
    $: {
        $tweenedScale
        leavesBottomMidlines = cohortMembersWithIndices.map(
            memberWithIndex => memberWithIndex.member.kind === "thingBaseWidgetModel" ?

                midline + 0.5 * (
                    [1, 2].includes(halfAxisId) ?   
                                leafOffsetsByIndex(memberWithIndex.member).x :
                                leafOffsetsByIndex(memberWithIndex.member).y
                ) :

                ([1, 2].includes(halfAxisId) ? thingWidth : thingHeight) * 0.5 + (([1, 2].includes(halfAxisId) ? thingWidth : thingHeight) + betweenThingSpacing) * memberWithIndex.index
        )
    }
    
    let leavesTopMidlines: number[]
    $: {
        $tweenedScale
        leavesTopMidlines = cohortMembersWithIndices.map(
            memberWithIndex => memberWithIndex.member.kind === "thingBaseWidgetModel" ?

                midline + 0.5 * (
                    [1, 2].includes(halfAxisId) ?   
                                leafOffsetsByIndex(memberWithIndex.member).x :
                                leafOffsetsByIndex(memberWithIndex.member).y
                ) :

                ([1, 2].includes(halfAxisId) ? thingWidth : thingHeight) * 0.5 + (([1, 2].includes(halfAxisId) ? thingWidth : thingHeight) + betweenThingSpacing) * memberWithIndex.index
        )
    }



















    /* Formatting-related information. */

    // Calculate color of Relationship image.
    const relationshipColor = relationshipColorByHalfAxisId[halfAxisId]

    // Calculate opacity.
    $: planeId = cohort?.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    $: opacity = 1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))


    /*
     * Add a blank Thing Form to the related Cohort.
     */
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
        left: calc({xOffset}px + 50% + {xOffsetToGrandparentThing}px);
        top: calc({yOffset}px + 50% + {yOffsetToGrandparentThing}px);
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
        {#if showDirection}
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
            style="
                width: {relationshipsWidth}px; height: {relationshipsLength}px;
                stroke: {relationshipColor}; fill: {relationshipColor};
            "
        >
            <!-- Relationship stem. -->
            {#if cohort.indexOfGrandparentThing === null}
                <g
                    class="relationship-stem"
                    style="
                        {
                            cohort.members.map(member => member.thingId).includes(hoveredThingIdStoreValue) || relationshipHovered ?
                                "opacity: 0.5;" :
                                ""
                        }
                    "
                    on:mouseenter={()=>{relationshipHovered = true}}
                    on:mouseleave={()=>{relationshipHovered = false}}
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

            {#if !(cohort.members.length === 1 && cohort.indexOfGrandparentThing !== null)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
                {#each cohortMembersWithIndices as memberWithIndex}
                    {#if cohort.indexOfGrandparentThing !== memberWithIndex.index}<!-- Don't re-draw the existing Relationship to a parent Thing. -->
                        
                    
                        <g
                            on:mouseenter={()=>{relationshipHovered = true; thingIdOfHoveredRelationship = memberWithIndex.member.thingId}}
                            on:mouseleave={()=>{relationshipHovered = false; thingIdOfHoveredRelationship = null}}
                        >    
                            <!-- Relationship fan segments. -->
                            <line 
                                class="relationship-fan-segment"
                                style="
                                    stroke-width: {3 / $tweenedScale};
                                    {
                                        memberWithIndex.member.thingId === hoveredThingIdStoreValue || memberWithIndex.member.thingId ===  thingIdOfHoveredRelationship ?
                                            "opacity: 0.1;" :
                                            ""
                                    }
                                "
                                x1="{midline}" y1="{stemTop}"
                                x2="{leavesBottomMidlines[memberWithIndex.index]}" y2="{leavesBottoms[memberWithIndex.index]}"
                            />

                            {#if !(memberWithIndex.member.kind === "thingBaseWidgetModel")}
                                <!-- Relationship leaves. -->
                                <line
                                    class="relationship-leaves"
                                    style="
                                        stroke-width: {3 / $tweenedScale};
                                        {
                                            memberWithIndex.member.kind === "thingBaseWidgetModel" ?
                                                `stroke-dasharray: ${1 / $tweenedScale} ${5 / $tweenedScale};` :
                                                ""
                                        }
                                        {
                                           memberWithIndex.member.thingId === hoveredThingIdStoreValue || memberWithIndex.member.thingId ===  thingIdOfHoveredRelationship ?
                                                "opacity: 0.5;" :
                                                ""
                                        }
                                    "
                                    x1="{leavesBottomMidlines[memberWithIndex.index]}" y1="{leavesBottoms[memberWithIndex.index]}"
                                    x2="{leavesTopMidlines[memberWithIndex.index]}" y2="{leavesTops[memberWithIndex.index]}"
                                />
                            {/if}
                        </g>


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

        pointer-events: none;
    }

    .relationships-widget:hover {
        border-radius: 5px;
        outline: dashed 1px lightgrey;
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
    }

    .relationship-stem {
        opacity: 0.25;

        cursor: pointer;

        pointer-events: auto;
    }

    .relationship-stem:hover {
        opacity: 0.5;
    }

    .relationship-stem:active {
        opacity: 1.0;
    }

    .relationship-fan-segment {
        opacity: 0.02;

        pointer-events: auto;
    }

    .relationship-leaves {
        opacity: 0.25;

        pointer-events: auto;
    }
</style>