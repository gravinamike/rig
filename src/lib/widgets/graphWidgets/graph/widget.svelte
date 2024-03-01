<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants and utility functions.
    import { tweened } from "svelte/motion"
    import { stringRepresentsInteger, urlHashToObject, legacyPerspectiveThingsParse, Rectangle } from "$lib/shared/utility"

    // Import stores.
    import { urlStore, graphBackgroundColorStore, lightenOrDarkenColorString, loadingState, openGraphStore, getGraphConstructs, addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh, relationshipBeingCreatedInfoStore } from "$lib/stores"

    // Import widget controller.
    import GraphWidgetController from "./controller.svelte"

    // Import sub-widgets.
    import { defaultGraphWidgetStyle, ThingCohortWidget } from "$lib/widgets/graphWidgets"
    import { cubicOut } from "svelte/easing"

    // Import API functions.
    import { markThingsVisited } from "$lib/db/makeChanges"
    


    export let pThingIds: (number | null)[]
    export let depth: number
    export let graph: Graph | null = null
    export let graphWidgetStyle = {...defaultGraphWidgetStyle}
    export let allowDirectChangesToPThingIds = false
    export let showGraph: boolean
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let allowZoomAndScrollToFit: boolean
    export let allowScrollToThingId: boolean
    export let thingIdToScrollTo: number | null
    export let animateZoomAndScroll = true



    // Variables handled by widget controller.
    let currentSpace: Space | null = null
    let scale = 1
    let tweenedScale: Tweened<number> = tweened( 1, { duration: 100, easing: cubicOut } )
    let zoomBounds: Rectangle = new Rectangle()
    let trackingMouse = false
    let handleMouseMove: (event: MouseEvent | TouchEvent) => void
    let handleTouchEnd: (event: TouchEvent) => void
    let handleWheelScroll: (event: WheelEvent) => void

    // HTML element handles.
    let widget: HTMLElement | null = null
    let centralAnchor: Element | null = null
    let zoomBoundsDiv: Element | null = null

    // Perspective-dependent Thing-texts.
    $: perspectiveTexts = legacyPerspectiveThingsParse(graph?.pThing?.perspectivetexts || "{}")

    
    // Auto-center the current focal point after resizing the Graph.
    let widgetWidth: number
    let widgetHeight: number
    let lastWidgetWidth: number | null = null
    let lastWidgetHeight: number | null = null
    let widgetWidthChange = 0
    let widgetHeightChange = 0

    async function processWidgetResize(widgetWidth: number, widgetHeight: number) {
        if (lastWidgetWidth !== null) widgetWidthChange = widgetWidth - lastWidgetWidth
        if (lastWidgetHeight !== null) widgetHeightChange = widgetHeight - lastWidgetHeight
        
        const xAdjustment = -widgetWidthChange / 2
        const yAdjustment = -widgetHeightChange / 2
        widget?.scrollBy(xAdjustment, yAdjustment)

        lastWidgetWidth = widgetWidth
        lastWidgetHeight = widgetHeight
    }

    $: processWidgetResize(widgetWidth, widgetHeight)

    const reticleColor = lightenOrDarkenColorString($graphBackgroundColorStore, "darker", 25)






















    $: if ($loadingState === "graphLoaded") {
        buildAndRefresh()
    }

    $: if (allowDirectChangesToPThingIds && pThingIds) {
        buildAndRefresh()
    }


    // ...or a refresh of the specific Graph ID is called for.
    $: if ( graph && $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
        allowZoomAndScrollToFit = true
    }

    // If the position in the Perspective History has changed, re-Perspect the Graph.
    $: if (graph) {
        const selectedHistoryThingId = graph.history.entryAtPosition.thingId
        
        if (
            !graph.rePerspectInProgressThingId
            && selectedHistoryThingId !== graph.pThingIds[0]
        ) rePerspectToThingId(selectedHistoryThingId, false, false)
    }



    /**
     * Build-and-refresh method.
     * Replaces any existing Graph with a new one, builds the new Graph, then
     * refreshes the viewers.
     */
    async function buildAndRefresh() {
        // Close any existing Graph.
        if (graph) {
            removeGraph(graph)
            graph = null
        }

        // Get information about which Space to use from the URL.
        const urlHashParams = urlHashToObject($urlStore.hash)
        const spaceIdToUse =
            "spaceId" in urlHashParams && stringRepresentsInteger(urlHashParams["spaceId"]) ? parseInt(urlHashParams["spaceId"]) :
            null
        const spaceToUse =
            spaceIdToUse !== null ? getGraphConstructs("Space", spaceIdToUse) as Space :
            null
        if (spaceIdToUse && !spaceToUse) {
            alert(`No Space with ID ${spaceIdToUse} was found. Using default Space instead.`)
        }

        // Open and build the new Graph.
        graph = await addGraph(pThingIds as number[], depth, null, false, false, spaceToUse)
        graphWidgetStyle = {...defaultGraphWidgetStyle}
        graphWidgetStyle.animateZoomAndScroll = animateZoomAndScroll
        await markThingsVisited(pThingIds as number[])

        // Refresh the Graph viewers.
        showGraph = true
        if (graph) addGraphIdsNeedingViewerRefresh(graph.id)
    }









</script>


<GraphWidgetController
    {graph}
    {widget}
    {centralAnchor}
    {widgetWidth}
    {widgetHeight}
    {zoomBoundsDiv}
    bind:graphWidgetStyle

    bind:currentSpace
    bind:scale
    bind:tweenedScale
    bind:zoomBounds
    bind:allowZoomAndScrollToFit
    bind:allowScrollToThingId
    bind:thingIdToScrollTo
    bind:trackingMouse
    bind:handleMouseMove
    bind:handleTouchEnd
    bind:handleWheelScroll
/>


<!-- Graph Widget. -->
<div
    class="graph-widget"
    bind:this={widget}
    bind:clientWidth={widgetWidth}
    bind:clientHeight={widgetHeight}

    on:mousedown={() => {
        if (!$relationshipBeingCreatedInfoStore.sourceThingId) trackingMouse = true
    }}
    on:touchstart={() => {
        if (!$relationshipBeingCreatedInfoStore.sourceThingId) trackingMouse = true
    }}
    on:mouseup={() =>
        trackingMouse = false
    }
    on:touchend={event => {
        trackingMouse = false
        handleTouchEnd(event)
    } }
    on:mousemove={handleMouseMove}
    on:touchmove={handleMouseMove}
    on:wheel|preventDefault={handleWheelScroll}
>

    <!-- Backfield (defines the outer bounds of the scrollable area). -->
    <div
        class="graph-backfield"
    >

        <!-- Central anchor (the center-point of the scrollable area, to which the center of the Graph is fixed.). -->
        <div
            class="central-anchor"
            bind:this={centralAnchor}
            style="scale: { graphWidgetStyle.animateZoomAndScroll ? $tweenedScale : scale };"
        >

            <!-- Zoom bounds (a Rectangle that closely hugs the edges of the Graph, defining the target for zooming). -->
            <div
                class="zoom-bounds"
                bind:this={zoomBoundsDiv}
                style="
                    left: {zoomBounds.x}px; top: {zoomBounds.y}px;
                    width: {zoomBounds.width}px; height: {zoomBounds.height}px;
                "
            />
            
            {#if graph?.rootCohort && graph.lifecycleStatus === "built"}
                <div
                    class="perspective-reticle"

                    style="
                        box-shadow: 0 0 5px 2px {reticleColor};
                        width: {graphWidgetStyle.relationDistance}px;
                        height: {graphWidgetStyle.relationDistance}px;
                        background-color: {reticleColor};
                    "
                />

                <!-- Root Cohort Widget (from which the rest of the Graph automatically "grows"). -->
                <ThingCohortWidget
                    thingCohort={graph.rootCohort}
                    thingCohortMembersToDisplay={graph.rootCohort.members}
                    bind:graph
                    {graphWidgetStyle}
                    bind:perspectiveTexts
                    {rePerspectToThingId}
                />
            {/if}

        </div>

    </div>
</div>


<style>
    .graph-widget {
        width: 100%;
        height: 100%;

        overflow: hidden;
        
        user-select: none;
    }

    .graph-backfield {
        width: 3000px;
        height: 3000px;

        display: flex;
        justify-content: center;
        align-items: center;

        cursor: grab;
    }

    .graph-backfield:active {
        cursor: grabbing;
    }

    .central-anchor {
        position: relative;
        width: 0px;
        height: 0px;
    }

    .zoom-bounds {
        position: absolute;
    }

    .perspective-reticle {
        border-radius: 50%;

        position: absolute;
        transform: translate(-50%, -50%);
        opacity: 0.1;
    }
  </style>