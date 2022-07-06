<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/graphModels"

    // Import basic framework functions.
    import { onMount } from "svelte"
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
    import { Rectangle, descendantElements, elementGroupEdges, sleep } from "$lib/shared/utility"

    // Import constants.
    import { zoomBase } from "$lib/shared/constants"

    import { relationshipBeingCreatedInfoStore } from "$lib/stores"

    // Import widgets.
    import { PlaneControls } from "$lib/widgets/controlWidgets"
    import { CohortWidget } from "$lib/widgets/graphWidgets"
    import SpaceFrameWidget from "./spaceFrameWidget.svelte"
    
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    // Set up reactively derived attributes of Graph.
    $: graphWidgetStyle = graph.graphWidgetStyle
    $: graphWidgetStyle.betweenThingSpacing = 0.01 * graphWidgetStyle.thingSpacingPercent * graphWidgetStyle.thingSize
    $: graphWidgetStyle.betweenThingGap = Math.max(0, graphWidgetStyle.betweenThingSpacing)
    $: graphWidgetStyle.betweenThingOverlap = Math.min(0, graphWidgetStyle.betweenThingSpacing)

    let graphWidget: HTMLElement
    let centralAnchor: Element
    let zoomBoundsDiv: Element
    const graphBounds = new Rectangle() // The "Graph bounds" describe the Graph as it's currently drawn in real screen-space (taking scale into account).
    const zoomBounds = new Rectangle() // The "zoom bounds" are in "scale-naive" space, calculated from the "Graph bounds".
    let trackingMouse = false
    let prevtrackingMouseLocation: { x: number | null, y: number | null } = { x: null, y: null }

    $: currentSpace = graph.startingSpace ?
        graph.startingSpace :
        graph.pThingBaseWidgetModel?.space || null


    // Set up reactive zooming and scrolling.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    $: tweenedScale = tweened(1, { duration: 100, easing: cubicOut })
    $: tweenedScale.set(scale)
    $: zoomPadding = graph.graphWidgetStyle.zoomPadding
    $: if (graph.allowScrollToThingId && graph.thingIdToScrollTo) { // Before graph is re-Perspected, scroll to new Perspective Thing.
        scrollToThingId(graph.thingIdToScrollTo)
    }
    $: if (centralAnchor && graph.allowZoomAndScrollToFit) { // When graph is re-built, scroll to central anchor, then zoom and scroll to fit.
        scrollToCentralAnchor(false)
        graph.allowZoomAndScrollToFit = false
        zoomAndScroll()
    }

    onMount(async () => {
        // Start the widget scrolled to center.
        scrollToCentralAnchor(false)
	})


    /** Manual zoom and scroll functions. */

    /**
     * Drag the Graph Widget when left-mouse is clicked and moving.
     */
    function handleMouseMove(event: MouseEvent) {
        if (trackingMouse && prevtrackingMouseLocation.x && prevtrackingMouseLocation.y) {
            let deltaX = event.clientX - prevtrackingMouseLocation.x
            let deltaY = event.clientY - prevtrackingMouseLocation.y
            graphWidget.scrollLeft = (graphWidget.scrollLeft - deltaX)
            graphWidget.scrollTop = (graphWidget.scrollTop - deltaY)
        }
        prevtrackingMouseLocation.x = event.clientX
        prevtrackingMouseLocation.y = event.clientY
    }

    /**
     * Zoom the Graph Widget (within allowed bounds) when the mousewheel is moved.
     */
    function handleWheelScroll(event: WheelEvent) {
        if ($relationshipBeingCreatedInfoStore.sourceWidgetModel === null) {
            const newZoom = graph.graphWidgetStyle.zoom + event.deltaY * -0.005
            if (-5 <= newZoom && newZoom <= 5) graph.graphWidgetStyle.zoom = newZoom
        }
    }

    
    /**
     * Auto-zoom and auto-scroll functions.
     */
    async function scrollToThingId(thingId: number): Promise<void> {
        const thingWidgetId = `graph#${graph.id}-thing#${thingId}`
        const thingWidget = document.getElementById(thingWidgetId)
        if (thingWidget) {
            thingWidget.scrollIntoView({behavior: graphWidgetStyle.animateZoomAndScroll ? "smooth" : "auto", block: "center", inline: "center"})
        }
        graph.allowScrollToThingId = false
    }

    /**
     * Update the Graph Widget bounds for the current configuration of the Graph.
     */
    function updateGraphBounds() {
        // Get all elements in the Graph, except the zoom bounds element.
        const descendants = descendantElements(centralAnchor)
        const descendantThingElements = descendants.filter(
            element => {
                if (typeof element.className === "string") return (
                    element.className.includes("thing-widget")
                    || element.className.includes("direction-widget")
                )
            }
        )

        // Set the Graph Widget bounds (as the outer bounds of the above collection of elements).
        const descendantsEdges = elementGroupEdges(descendantThingElements)
        Object.assign(graphBounds, descendantsEdges)
        graphBounds.width = graphBounds.right - graphBounds.left
        graphBounds.height = graphBounds.bottom - graphBounds.top
        graphBounds.x = graphBounds.left - centralAnchor.getBoundingClientRect().x
        graphBounds.y = graphBounds.top - centralAnchor.getBoundingClientRect().y
    }

    /**
     * Zoom the Graph Widget to fit the Graph.
     */
    async function zoomToFit(): Promise<void> {
        // Update the Graph bounds.
        updateGraphBounds()

        // Set the zoom bounds from the Graph bounds.
        zoomBounds.x = graphBounds.x / scale - zoomPadding
        zoomBounds.y = graphBounds.y / scale - zoomPadding
        zoomBounds.width = graphBounds.width / scale + 2 * zoomPadding
        zoomBounds.height = graphBounds.height / scale + 2 * zoomPadding

        // Determine the scale change based on the ratio between the Graph Widget frame and the padded Graph.
        const scaleChangeX = graphWidget.getBoundingClientRect().width / (zoomBounds.width * scale)
        const scaleChangeY = graphWidget.getBoundingClientRect().height / (zoomBounds.height * scale)
        const scaleChange = Math.min(scaleChangeX, scaleChangeY)

        // Determine the new scale, and set the Graph's zoom accordingly.
        const newScale = scaleChange * scale
        const newZoom = Math.log(newScale) / Math.log(1.45)
        graph.graphWidgetStyle.zoom = newZoom
    }

    /**
     * Scroll the Graph Widget to the true center position (the location of the central anchor).
     */
    async function scrollToCentralAnchor(smooth: boolean = true): Promise<void> {
        centralAnchor.scrollIntoView({behavior: smooth ? "smooth" : "auto", block: "center", inline: "center"})
    }

    /**
     * Scroll the Graph Widget so that the Graph is centered.
     */
    async function scrollToZoomBoundsCenter(): Promise<void> {
        updateGraphBounds()
        if (graphWidgetStyle.animateZoomAndScroll) {
            zoomBoundsDiv.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        } else {
            zoomBoundsDiv.scrollIntoView({block: "center", inline: "center"})
        }
    }

    /**
     * Zoom, then scroll, the Graph Widget to fit and center the Graph.
     */
    async function zoomAndScroll() {
        await sleep(10) // Allow time for Graph re-draw before zooming.
        await zoomToFit()
        await sleep(100)
        await scrollToZoomBoundsCenter()
    }
</script>


<div
    class="graph-widget"
    bind:this={graphWidget}
    on:mousedown={() => {if (!$relationshipBeingCreatedInfoStore.sourceWidgetModel) trackingMouse = true}}
    on:mouseup={() => trackingMouse = false}
    on:mousemove={handleMouseMove}
    on:wheel|preventDefault={(event) => {handleWheelScroll(event)}}
>

    <!-- Backfield (defines the outer bounds of the scrollable area). -->
    <div class="graph-backfield">
        <div
            class="central-anchor"
            bind:this={centralAnchor}
            style="scale: {graphWidgetStyle.animateZoomAndScroll ? $tweenedScale : scale};"
        >
            <!-- Zoom bounds (closely surrounds the Graph). -->
            <div
                class="zoom-bounds"
                bind:this={zoomBoundsDiv}
                style="left: {zoomBounds.x}px; top: {zoomBounds.y}px; width: {zoomBounds.width}px; height: {zoomBounds.height}px;"
            />
            
            <!-- Root Cohort Widget (from which the rest of the Graph automatically "grows"). -->
            {#if graph.rootThingCohortWidgetModel}
                <CohortWidget
                    thingCohortWidgetModel={graph.rootThingCohortWidgetModel}
                    bind:graph
                    {rePerspectToThingId}
                />
            {/if}
        </div>
    </div>
    
    <!-- Plane controls. -->
    {#if Object.keys(graph.planes._members).length > 1}
        <div class="plane-controls-container">
            <PlaneControls
                bind:graph
            />
        </div>
    {/if}

    <!-- Space frame. -->
    <SpaceFrameWidget
        {graph}
        {currentSpace}
    />
</div>


<style>
    .graph-widget {
        width: 100%;
        height: 100%;
        background-color: #eef8ff;

        overflow: hidden;
        
        user-select: none;
    }

    .graph-backfield {
        width: 3000px;
        height: 3000px;

        display: flex;
        justify-content: center;
        align-items: center;

        cursor: all-scroll;
    }

    .central-anchor {
        position: relative;
        width: 0px;
        height: 0px;
    }

    .zoom-bounds {
        position: absolute;
    }

    .plane-controls-container {
        border-radius: 5px;
        box-shadow: 5px 5px 10px 2px lightgray;

        position: absolute;
        left: 20px;
        bottom: 20px;
    }
  </style>