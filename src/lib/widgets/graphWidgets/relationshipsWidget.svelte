<script context="module" lang="ts">
    // Type imports.
    import type { Space } from "$lib/models/dbModels"
    import type { Graph, Cohort } from "$lib/models/graphModels"

    // Stores imports.
    import { hoveredThingIdStore } from "$lib/stores"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { mirroringByHalfAxisId, relationshipColorByHalfAxisId, zoomBase } from "$lib/shared/constants"
    import { sleep } from "$lib/shared/utility"

    // Model imports.
    import { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels"
</script>

<script lang="ts">
    export let cohort: Cohort
    export let space: Space
    export let graph: Graph


    const relationshipsWidgetModel = new RelationshipsWidgetModel(cohort, space, graph)


    /* Information related to hovered Thing. */
    let hoveredThingIdStoreValue: number | null = null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    let relationshipHovered = false
    let thingIdOfHoveredRelationship: number | null = null

    /* Basic Widget information. */
    
    // Information related to the Relationships Widget's place in the Graph.
    const halfAxisId = relationshipsWidgetModel.halfAxisId
    

    // Graph-scale-related variables.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    // Information related to Direction.
    const directionId = relationshipsWidgetModel.directionId
    const direction = relationshipsWidgetModel.direction
    $: showDirection = relationshipsWidgetModel.parentThingWidgetModel.address.generationId === 0 || relationshipHovered ?
        true :
        false


    // Calculate color and opacity of Relationship image.
    const relationshipColor = relationshipColorByHalfAxisId[halfAxisId]
    $: opacity = relationshipsWidgetModel.opacity



    /* Variables related to whole-Widget geometry. */

    // Variables related to the geometry of Graph construct widgets.
    $: relationDistance = graph.graphWidgetStyle.relationDistance // The center-to-center distance between two related Things.
    $: thingWidth = relationshipsWidgetModel.parentThingWidgetModel.thingWidth
    $: thingHeight = relationshipsWidgetModel.parentThingWidgetModel.thingHeight
    $: betweenThingSpacing = graph.graphWidgetStyle.betweenThingSpacing

    // Variables related to the x, y, and z position of this Relationships Widget (relative to parent Thing Widget).
    let xOffset: number
    let yOffset: number
    $: {
        relationDistance
        xOffset = relationshipsWidgetModel.xOffset
        yOffset = relationshipsWidgetModel.yOffset
    }
    const zIndex = relationshipsWidgetModel.zIndex

    // Variables related to rotation and mirroring of Relationship image.
    const rotation = relationshipsWidgetModel.rotation
    const mirroring = mirroringByHalfAxisId[halfAxisId]
    

    // Variables related to the widths and heights of this Relationships Widget.
    let relationshipsWidth: number
    let relationshipsLength: number
    let widgetWidth: number
    let widgetHeight: number
    /* Variables related to the geometries of the Widget's parts. */
    let xOffsetToGrandparentThing: number
    let yOffsetToGrandparentThing: number
    let midline: number
    let stemBottom: number
    let stemTop: number
    let leavesGeometries: { bottom: number, top: number, bottomMidline: number, topMidline: number }[]
    $: {
        relationDistance
        thingWidth
        thingHeight
        betweenThingSpacing
        $tweenedScale

        relationshipsWidth = relationshipsWidgetModel.relationshipsWidth
        relationshipsLength = relationshipsWidgetModel.relationshipsLength
        widgetWidth = relationshipsWidgetModel.widgetWidth
        widgetHeight = relationshipsWidgetModel.widgetHeight
        xOffsetToGrandparentThing = relationshipsWidgetModel.xOffsetToGrandparentThing
        yOffsetToGrandparentThing = relationshipsWidgetModel.yOffsetToGrandparentThing
        midline = relationshipsWidgetModel.midline
        stemBottom = relationshipsWidgetModel.stemBottom
        stemTop = relationshipsWidgetModel.stemTop
        leavesGeometries = relationshipsWidgetModel.leavesGeometries($tweenedScale)
    }


    // Construct a list of the related Things along with their indices.
    $: cohortMembersWithIndices = relationshipsWidgetModel.cohortMembersWithIndices





















    





    /*
     * Add a blank Thing Form to the related Cohort.
     */
    async function addThingForm() {
        const newThingWidgetModel = new ThingWidgetModel(null, graph)
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
                                x2="{leavesGeometries[memberWithIndex.index].bottomMidline}" y2="{leavesGeometries[memberWithIndex.index].bottom}"
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
                                    x1="{leavesGeometries[memberWithIndex.index].bottomMidline}" y1="{leavesGeometries[memberWithIndex.index].bottom}"
                                    x2="{leavesGeometries[memberWithIndex.index].topMidline}" y2="{leavesGeometries[memberWithIndex.index].top}"
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
        opacity: 0.05;

        pointer-events: auto;
    }

    .relationship-leaves {
        opacity: 0.25;

        pointer-events: auto;
    }
</style>