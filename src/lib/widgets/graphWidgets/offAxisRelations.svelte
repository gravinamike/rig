<script lang="ts">
    // Import types.
    import type { Graph, Space, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "./graph"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import constants and stores.
    import { zoomBase } from "$lib/shared/constants"
    import {
        addGraph, removeGraph, reorderingInfoStore, readOnlyMode,
        graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh,
        removeGraphIdsNeedingViewerRefresh
    } from "$lib/stores"

    // Import related widgets.
    import { WaitingIndicator } from "$lib/widgets/layoutWidgets"
    import { GraphOutlineWidget } from "$lib/widgets/graphWidgets"
    import { defaultGraphWidgetStyle } from "./graph"


    export let parentThing: Thing
    export let parentGraph: Graph
    export let parentGraphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    // ID of the widget's parent Thing.
    $: parentThingId = parentThing.id as number

    // Information about related Things.
    $: numberOfOffAxisRelations = parentThing.offAxisRelatedThingIds((parentThing.space as Space)).length
    $: numberOfNonCartesianAxisRelations = parentThing.nonCartesianAxisRelatedThingIds((parentThing.space as Space)).length


    /* Whole-widget-related attributes. */

    // Expanded/collapsed flag.
    let expanded = false

    // Start expanded if parent Thing is Generation 0 and has
    // non-Cartesian axis relations to display.
    $: if (parentThing.address?.generationId === 0 && nonCartesianAxesContainThings) {
        expanded = true
    }

    // Whether to show the off-axis relations.
    $: showOffAxisRelations =
        (
            numberOfOffAxisRelations
            || numberOfNonCartesianAxisRelations
        )
        && expanded


    /* Off-axis toggle-related attributes. */

    // Off-axis toggle arrow geometry.
    const offAxisToggleSize = 25
    $: offAxisToggleDiagonal = Math.hypot(offAxisToggleSize, offAxisToggleSize)
    $: offAxisToggleDiagonalOverhang = (offAxisToggleDiagonal - offAxisToggleSize) / 2 + 4

    // Off-axis toggle state attributes.
    let offAxisToggleToggleHovered = false
    $: showOffAxisToggle = (
        (
            !$reorderingInfoStore.reorderInProgress
            && offAxisToggleToggleHovered
        )
        || showOffAxisRelations
    )
    $: offAxisToggleNoMouseEvents =
        (
            $readOnlyMode
            && !(numberOfNonCartesianAxisRelations + numberOfOffAxisRelations)
        )
        || (
            parentThing.address?.generationId === 0
            && nonCartesianAxesContainThings
        )
    $: showOffAxisNumberOfRelationsIndicator =
        (numberOfNonCartesianAxisRelations + numberOfOffAxisRelations)
        && !expanded

    // Scale-related attributes.
    $: scale = zoomBase ** parentGraphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)


    /* Off-axis-relations-related attributes. */

    // Whether there are related Things in the non-Cartesian axes.
    $: nonCartesianAxesContainThings = parentThing.childThingCohorts.filter(
        thingCohort => (
            [5, 6, 7, 8].includes(thingCohort.halfAxisId)
            && thingCohort.members.length
        )
    ).length !== 0


    /* Sub-Graph related attributes. */

    // The off-axis-relations Graph is created and removed when the toggle is
    // expanded and collapsed, respectively.
    let graph: Graph | null = null
    async function createGraph() {
        // Close any existing Graph.
        if (graph !== null) await removeGraph(graph)

        // Open and build the new Graph.
        const parentGraphSpace = parentGraph.pThing?.space as Space
        graph = await addGraph([parentThingId], 1, parentGraph, true, false, parentGraphSpace)
        graphWidgetStyle = {...defaultGraphWidgetStyle}

        // Configure style for off-axis styling, if applicable.
        graphWidgetStyle.excludePerspectiveThing = true
        graphWidgetStyle.excludeCartesianAxes = true
        graphWidgetStyle.excludeNonAxisThingCohorts = numberOfNonCartesianAxisRelations !== 0

        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
    $: if (expanded) {
        createGraph()
    }
    $: if (!expanded) {
        if (graph !== null) removeGraph(graph)
        graph = null
    }

    // Set up Graph refreshing.
    $: if ( graph?.lifecycleStatus === "built" && $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
    }

    // Rebuild-Graph method.
    async function rebuildGraph() {
        if (!graph) return
        await graph.build()
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    // Graph outline widget style.
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}


    /* Non-axis-toggle-related attributes. */

    // Non-axis toggle arrow geometry.
    let nonAxisToggleSize = 25

    // Off-axis toggle state attributes.
    let nonAxisToggleHovered = false
    $: showNonAxisToggle =
        (
            !$reorderingInfoStore.reorderInProgress
            && nonAxisToggleHovered
        )
        || !graphWidgetStyle.excludeNonAxisThingCohorts
    $: showNonAxisNumberOfRelationsIndicator = graphWidgetStyle.excludeNonAxisThingCohorts && numberOfOffAxisRelations
</script>


<!-- Off-axis relations toggle. -->
<div
    class="off-axis-relations-toggle"
    class:expanded
    class:no-mouse-events={offAxisToggleNoMouseEvents}

    style="width: {offAxisToggleSize}px; height: {offAxisToggleSize}px;"

    on:mouseenter={()=>{offAxisToggleToggleHovered = true}}
    on:mouseleave={()=>{offAxisToggleToggleHovered = false}}
    on:click={() => {expanded = !expanded}}
    on:keydown={()=>{}}
>
    
    <!-- Visible toggle image. -->
    {#if showOffAxisToggle}
        <svg
            class="relationship-image"
            style="width: {offAxisToggleSize}px; height: {offAxisToggleSize}px;"
        >
            <line
                x1="{offAxisToggleSize / 2}" y1="{-offAxisToggleDiagonalOverhang}"
                x2="{offAxisToggleSize / 2}" y2="{offAxisToggleSize + offAxisToggleDiagonalOverhang - 6 / $tweenedScale}"
                style="stroke-width: {10 / $tweenedScale};"
            />
            <polygon
                points="
                    {offAxisToggleSize / 2 - 5 / $tweenedScale}, {offAxisToggleSize + offAxisToggleDiagonalOverhang - 8 / $tweenedScale}
                    {offAxisToggleSize / 2 + 5 / $tweenedScale}, {offAxisToggleSize + offAxisToggleDiagonalOverhang - 8 / $tweenedScale}
                    {offAxisToggleSize / 2}, {offAxisToggleSize + offAxisToggleDiagonalOverhang}
                "
                style="stroke-width: {3 / $tweenedScale};"
            />
        </svg>
    {/if}

    <!-- Number-of-off-axis-relations indicator. -->
    {#if showOffAxisNumberOfRelationsIndicator}
        <div>+{numberOfNonCartesianAxisRelations + numberOfOffAxisRelations}</div>
    {/if}
</div>

<!-- Off-axis-relations display. -->
{#if showOffAxisRelations}
    <div class="off-axis-relations-widget-and-unshown-indicator">
        <div
            class="off-axis-relations-widget"
            on:wheel|stopPropagation
        >
            <!-- Graph outline widget. -->
            {#if graph && graph.lifecycleStatus === "built"}
                <GraphOutlineWidget
                    bind:graph
                    fullSize={false}
                    bind:graphWidgetStyle
                    {rePerspectToThingId}
                />

            <!-- Waiting indicator. -->
            {:else}
                <WaitingIndicator
                    states={
                        {
                            waiting: {
                                text: "",
                                imageName: "waiting"
                            },
                        }
                    }
                    currentStateName={"waiting"}
                />
            {/if}
        </div>

        <!-- Non-axis relations toggle. -->
        {#if numberOfNonCartesianAxisRelations !== 0}
            <div
                class="non-axis-relations-toggle"

                style="width: {nonAxisToggleSize}px; height: {nonAxisToggleSize}px;"

                on:mouseenter={()=>{nonAxisToggleHovered = true}}
                on:mouseleave={()=>{nonAxisToggleHovered = false}}
                on:click={() => {
                    graphWidgetStyle.excludeNonAxisThingCohorts = !graphWidgetStyle.excludeNonAxisThingCohorts
                    rebuildGraph()
                }}
                on:keydown={()=>{}}
            >
                <!-- Visible toggle image. -->
                {#if showNonAxisToggle}
                    <svg
                        style="
                            width: {nonAxisToggleSize}px; height: {nonAxisToggleSize}px;
                            transform: rotate({
                                graphWidgetStyle.excludeNonAxisThingCohorts ? 0 :
                                180
                            }deg);
                        "
                    >
                        <polygon
                            points="
                                2, 0
                                {offAxisToggleSize - 2}, 0
                                {offAxisToggleSize / 2}, {offAxisToggleSize / 2}
                            "
                            style="stroke-width: {3 / $tweenedScale};"
                        />
                    </svg>
                {/if}

                <!-- Number-of-off-axis-relations indicator. -->
                {#if showNonAxisNumberOfRelationsIndicator}
                    <div>+{numberOfOffAxisRelations}</div>
                {/if}
            </div>
        {/if}
        
    </div>
{/if}


<style>
    .off-axis-relations-toggle {
        position: absolute;
        left: 100%;
        top: 100%;

        font-size: 1.25rem;

        pointer-events: none;
    }

    .off-axis-relations-toggle:not(.no-mouse-events) {
        pointer-events: auto;
        cursor: pointer;
    }

    .relationship-image {
        position: absolute;
        z-index: -1;
        transform: rotate(-45deg);
        
        stroke: dimgrey;
        fill: dimgrey;
        opacity: 0.5;

        overflow: visible;
    }

    .off-axis-relations-widget-and-unshown-indicator {
        position: absolute;
        left: calc(100% + 25px);
        top: calc(100% + 25px);
        z-index: 1;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .off-axis-relations-widget {
        width: 300px;
        max-height: 300px;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
        
        pointer-events: auto;
        cursor: default;
    }

    .non-axis-relations-toggle {
        pointer-events: auto;
        cursor: pointer;
    }

    .non-axis-relations-toggle svg {
        position: absolute;
        z-index: -1;
        
        stroke: dimgrey;
        fill: dimgrey;
        opacity: 0.5;
    }
</style>