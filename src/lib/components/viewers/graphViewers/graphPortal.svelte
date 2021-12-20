<script lang="ts">
    // Basic UI imports.
    import { onMount } from "svelte"
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
    import { Rectangle, descendantElements, elementGroupEdges, sleep } from "$lib/shared/utility"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/components/layoutElements/tabs"

    // Graph model imports.
    import { Graph } from "$lib/shared/graph/graph"

    // Side-interface imports.
    import GraphSettingsView from "$lib/components/viewers/settingsViewers/graphSettingsView.svelte"
    import GraphSchematicView from "$lib/components/viewers/graphViewers/graphSchematicView.svelte"
    import GraphHistoryView from "$lib/components/viewers/graphViewers/graphHistoryView.svelte"
    import GraphPinsView from "$lib/components/viewers/graphViewers/graphPinsView.svelte"
    import NotesViewer from "$lib/components/viewers/notesViewer/notesViewer.svelte"

    // Portal-related imports.
    import { zoomBase } from "$lib/shared/constants"
    import PlaneControls from "$lib/components/controlElements/planeControls.svelte"
    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"
    

    export let pThingIds: number[]
    export let depth: number


    let portal: Element
    let centralAnchor: Element
    let zoomBoundsDiv: Element
    const graphBounds = new Rectangle() // The "Graph bounds" describe the Graph as it's currently drawn in real screen-space (taking scale into account).
    const zoomBounds = new Rectangle() // The "zoom bounds" are in "scale-naive" space, calculated from the "Graph bounds".
    let trackingMouse = false
    let prevtrackingMouseLocation: { x: number | null, y: number | null } = { x: null, y: null }


    // Initialize the Graph.
    let graph = new Graph(pThingIds, depth)

    // Set up reactive zooming and scrolling.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)
    $: zoomPadding = graph.graphWidgetStyle.zoomPadding
    $: if (graph.allowScrollToThingId && graph.thingIdToScrollTo) { // Before graph is re-Perspected, scroll to new Perspective Thing.
        scrollToThingId(graph.thingIdToScrollTo)
    }
    $: if (graph.allowZoomAndScrollToFit) { // When graph is re-built, scroll to central anchor, then zoom and scroll to fit.
        scrollToCentralAnchor(false)
        zoomAndScroll()
    }   

    onMount(async () => {
        // Start the portal scrolled to center.
        scrollToCentralAnchor(false)

        // Build the Graph.
        await graph.build()
        //graph.allowZoomAndScrollToFit = true`
        graph = graph // Needed for reactivity.
	})


    /** Manual zoom and scroll functions. */

    /**
     * Drag the Portal when left-mouse is clicked and moving.
     */
     function handleMouseMove(event: MouseEvent) {
        if (trackingMouse && prevtrackingMouseLocation.x && prevtrackingMouseLocation.y) {
            let deltaX = event.clientX - prevtrackingMouseLocation.x
            let deltaY = event.clientY - prevtrackingMouseLocation.y
            portal.scrollLeft = (portal.scrollLeft - deltaX)
            portal.scrollTop = (portal.scrollTop - deltaY)
        }
        prevtrackingMouseLocation.x = event.clientX
        prevtrackingMouseLocation.y = event.clientY
    }

    /**
     * Zoom the Portal (within allowed bounds) when the mousewheel is moved.
     */
    function handleWheelScroll(event: WheelEvent) {
        const newZoom = graph.graphWidgetStyle.zoom + event.deltaY * -0.005
        if (-5 <= newZoom && newZoom <= 5) graph.graphWidgetStyle.zoom = newZoom
    }

    /** Auto-zoom and auto-scroll functions. */

    async function scrollToThingId(thingId: number): Promise<void> {
        const thingWidgetId = `portal#${graph.id}-thing#${thingId}`
        const thingWidget = document.getElementById(thingWidgetId)
        if (thingWidget) {
            thingWidget.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        }
        graph.allowScrollToThingId = false
    }

    /**
     * Update the Graph bounds for the current configuration of the Graph.
     */
    function updateGraphBounds() {
        // Get all elements in the Portal, except the zoom bounds element.
        const descendants = descendantElements(centralAnchor)
        const index = descendants.indexOf(zoomBoundsDiv)
        if (index > -1) descendants.splice(index, 1)

        // Set the Graph bounds (as the outer bounds of the above collection of elements).
        const descendantsEdges = elementGroupEdges(descendants)
        Object.assign(graphBounds, descendantsEdges)
        graphBounds.width = graphBounds.right - graphBounds.left
        graphBounds.height = graphBounds.bottom - graphBounds.top
        graphBounds.x = graphBounds.left - centralAnchor.getBoundingClientRect().x
        graphBounds.y = graphBounds.top - centralAnchor.getBoundingClientRect().y
    }

    /**
     * Zoom the Portal to fit the Graph.
     */
    async function zoomToFit(): Promise<void> {
        // Update the Graph bounds.
        updateGraphBounds()

        // Set the zoom bounds from the Graph bounds.
        zoomBounds.x = graphBounds.x / scale - zoomPadding
        zoomBounds.y = graphBounds.y / scale - zoomPadding
        zoomBounds.width = graphBounds.width / scale + 2 * zoomPadding
        zoomBounds.height = graphBounds.height / scale + 2 * zoomPadding
        console.log(portal.getBoundingClientRect().width, (zoomBounds.width * scale))

        // Determine the scale change based on the ratio between the portal frame and the padded Graph.
        const scaleChangeX = portal.getBoundingClientRect().width / (zoomBounds.width * scale)
        const scaleChangeY = portal.getBoundingClientRect().height / (zoomBounds.height * scale)
        const scaleChange = Math.min(scaleChangeX, scaleChangeY)

        // Determine the new scale, and set the Graph's zoom accordingly.
        console.log(scaleChange, scale)
        const newScale = scaleChange * scale
        console.log('NEW SCALE', newScale)
        const newZoom = Math.log(newScale) / Math.log(1.45)
        graph.graphWidgetStyle.zoom = newZoom
    }

    /**
     * Scroll the Portal to the true center position (the location of the central anchor).
     */
     async function scrollToCentralAnchor(smooth: boolean = true): Promise<void> {
        centralAnchor.scrollIntoView({behavior: smooth ? "smooth" : "auto", block: "center", inline: "center"})
    }

    /**
     * Scroll the Portal so that the Graph is centered.
     */
    async function scrollToZoomBoundsCenter(smooth: boolean = true): Promise<void> {
        updateGraphBounds()
        zoomBoundsDiv.scrollIntoView({behavior: smooth ? "smooth" : "auto", block: "center", inline: "center"})
    }

    /**
     * Zoom, then scroll, the Portal to fit and center the Graph.
     */
    async function zoomAndScroll() {
        await zoomToFit()
        await sleep(100)
        await scrollToZoomBoundsCenter()
        graph.allowZoomAndScrollToFit = false
    }
</script>


<main>
    <!-- Graph-related viewers (Schematic and Settings) -->
    <Collapser
        headerText={"Graph"}
        contentDirection={"left"}
        expanded={true}
    >
        <div class="tabs-container">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Settings</TabFlap>
                    <TabFlap>Schematic</TabFlap>
                </TabFlaps>
            
                <!-- Graph Settings viewer -->
                <TabBody>
                    <GraphSettingsView
                        bind:graph
                    />
                </TabBody>

                <!-- Graph Schematic viewer -->
                <TabBody>
                    <GraphSchematicView
                        {graph}
                    />
                </TabBody>
            </TabBlock>
        </div>
    </Collapser>

    <!-- Navigation-related viewers (Pins and History) -->
    <Collapser
        headerText={"Navigation"}
        contentDirection={"left"}
        expanded={true}
    >
        <div class="navigation-view">
            <!-- Graph pins viewer -->
            <div class="pins-container">
                <GraphPinsView
                    bind:graph
                />
            </div>

            <!-- Graph history viewer -->
            <div class="history-container">
                <GraphHistoryView
                    bind:graph
                />
            </div>
        </div>
    </Collapser>

    <!-- Graph Portal -->
    <div class="portal-container">
        <div
            class="portal"
            bind:this={portal}
            on:mousedown={() => trackingMouse = true}
            on:mouseup={() => trackingMouse = false}
            on:mousemove={handleMouseMove}
            on:wheel|preventDefault={(event) => {handleWheelScroll(event)}}
        >
            <!-- Backfield (defines the outer bounds of the scrollable area). -->
            <div class="portal-backfield">
                <div
                    class="central-anchor"
                    bind:this={centralAnchor}
                    style="scale: {$tweenedScale};"
                >
                    <!-- Zoom bounds (closely surrounds the Graph). -->
                    <div
                        class="zoom-bounds"
                        bind:this={zoomBoundsDiv}
                        style="left: {zoomBounds.x}px; top: {zoomBounds.y}px; width: {zoomBounds.width}px; height: {zoomBounds.height}px;"
                    />
                    
                    <!-- Root Cohort (from which the rest of the Graph automatically "grows"). -->
                    {#if graph.rootCohort}
                        <CohortWidget
                            cohort={graph.rootCohort}
                            bind:graph
                        />
                    {/if}
                </div>
            </div>
            
            <!-- Plane controls. -->
            {#if Object.keys(graph.planes).length > 1}
                <div class="plane-controls-container">
                    <PlaneControls
                        bind:graph
                    />
                </div>
            {/if}
        </div>
    </div>

    <!-- Notes viewer -->
    <Collapser headerText={"Notes"} contentDirection={"right"}>
        <NotesViewer
            {graph}
        />
    </Collapser>

</main>


<style>
    main {
        flex: 1 1 auto;
        min-width: 0;

        position: relative;

        display: flex;
        flex-direction: row;
    }

    .tabs-container {
        width: 200px;
        height: 100%;
        
        overflow: hidden;
    }

    .navigation-view {
        width: 150px;
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: auto;
    }

    .pins-container {
        flex: 0 0 auto;
    }

    .history-container {
        flex: 1 1 auto;
    }

    .portal-container {
        flex: 1 1 auto;
        min-width: 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
    }

    .portal {
        width: 100%;
        height: 100%;

        overflow: hidden;
        
        user-select: none;
    }

    .portal-backfield {
        width: 3000px;
        height: 3000px;

        display: flex;
        justify-content: center;
        align-items: center;
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