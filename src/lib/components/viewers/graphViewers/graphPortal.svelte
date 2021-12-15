<script lang="ts">
    import { onMount } from "svelte"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/components/layoutElements/tabs"

    import { Graph } from "$lib/shared/graph/graph"

    import GraphSchematicView from "$lib/components/viewers/graphViewers/graphSchematicView.svelte"
    import GraphSettingsView from "$lib/components/viewers/settingsViewers/graphSettingsView.svelte"
    import GraphHistoryView from "$lib/components/viewers/graphViewers/graphHistoryView.svelte"
    import GraphPinsView from "$lib/components/viewers/graphViewers/graphPinsView.svelte"

    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"
    import PlaneControls from "$lib/components/controlElements/planeControls.svelte"
    import NotesViewer from "$lib/components/viewers/notesViewer/notesViewer.svelte"

    export let pThingIds: number[]
    export let depth: number


    // Initialize the Graph.
    let graph = new Graph(pThingIds, depth)

    $: if (graph.allowZoomAndScrollToFit) zoomAndScroll()

    $: scale = 1.45 ** graph.graphWidgetStyle.zoom // 1.45 should be in constants as "zoomSensitivity", with a floor of 1.

    onMount(async () => {
        // Build the Graph.
        await graph.build()
        graph.allowZoomAndScrollToFit = true
        graph = graph // Needed for reactivity.
	})



    let portal: Element
    let centralAnchor: Element
    let zoomBounds: Element
    let zoomPadding = 50

    // The "Graph bounds" parameters are taken from real screen-space (taking graph
    // scale into account). They describe the Graph as it's currently drawn.
    let graphTop = 0
    let graphRight = 0
    let graphBottom = 0
    let graphLeft = 0
    let graphWidth = 0
    let graphHeight = 0
    let graphX = 0
    let graphY = 0

    // The "zoom bounds" parameters are in "scale-naive" space, calculated from the
    // "Graph bounds".
    let zoomBoundsX = 0
    let zoomBoundsY = 0
    let zoomBoundsWidth = 0
    let zoomBoundsHeight = 0


    function descendantElements(element: Element, descendants?: Element[]): Element[] {
        if ( descendants === undefined ) descendants = []
        for (var i = 0; i < element.children.length; i++) {
            descendants.push(element.children[i])
            descendantElements(element.children[i], descendants)
        }
        return descendants
    }

    function updateGraphBounds() {
        // Get all elements in the Portal, except the zoom bounds element.
        const descendants = descendantElements(centralAnchor)
        const index = descendants.indexOf(zoomBounds)
        if (index > -1) descendants.splice(index, 1)

        // Set the Graph bounds (as the outer bounds of the above collection of elements).
        graphTop = descendants.length ?
            Math.min( ...descendants.map((descendant) => {return descendant.getBoundingClientRect().top}) ) : 
            0
        graphRight = descendants.length ?
            Math.max( ...descendants.map((descendant) => {return descendant.getBoundingClientRect().right}) ) :
            0
        graphBottom = descendants.length ?
            Math.max( ...descendants.map((descendant) => {return descendant.getBoundingClientRect().bottom}) ) :
            0
        graphLeft = descendants.length ?
            Math.min( ...descendants.map((descendant) => {return descendant.getBoundingClientRect().left}) ) :
            0
        graphWidth = graphRight - graphLeft
        graphHeight = graphBottom - graphTop
        graphX = graphLeft - centralAnchor.getBoundingClientRect().x
        graphY = graphTop - centralAnchor.getBoundingClientRect().y
    }

    function zoomToFit() {
        updateGraphBounds()

        // Set the zoom bounds from the Graph bounds.
        zoomBoundsX = graphX / scale - zoomPadding
        zoomBoundsY = graphY / scale - zoomPadding
        zoomBoundsWidth = graphWidth / scale + 2 * zoomPadding
        zoomBoundsHeight = graphHeight / scale + 2 * zoomPadding

        const scaleChangeX = portal.getBoundingClientRect().width / (zoomBoundsWidth * scale)
        const scaleChangeY = portal.getBoundingClientRect().height / (zoomBoundsHeight * scale)
        const scaleChange = Math.min(scaleChangeX, scaleChangeY)

        const newScale = scaleChange * scale
        const newZoom = Math.log(newScale) / Math.log(1.45)
        graph.graphWidgetStyle.zoom = newZoom
    }

    function scrollToCenter() {
        updateGraphBounds()
        zoomBounds.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
    }

    async function zoomAndScroll() {
        await zoomToFit()
        await scrollToCenter()
        graph.allowZoomAndScrollToFit = false
    }


    let tracking = false
    let prevLocation: { x: number | null, y: number | null } = { x: null, y: null }

    function handleMouseMove(event: MouseEvent) {
        if (tracking && prevLocation.x && prevLocation.y) {
            let deltaX = event.clientX - prevLocation.x
            let deltaY = event.clientY - prevLocation.y
            portal.scrollLeft = (portal.scrollLeft - deltaX)
            portal.scrollTop = (portal.scrollTop - deltaY)
        }
        prevLocation.x = event.clientX
        prevLocation.y = event.clientY
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
            <div class="pins-container">
                <!-- Graph pins viewer -->
                <GraphPinsView
                    bind:graph
                />
            </div>

            <div class="history-container">
                <!-- Graph history viewer -->
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
            on:mousedown={() => tracking = true}
            on:mouseup={() => tracking = false}
            on:mousemove={handleMouseMove}
        >
            <div class="portal-backfield">
                <div
                    class="central-anchor"
                    bind:this={centralAnchor}
                    style="scale: {scale};"
                >
                    <div
                        class="zoom-bounds"
                        bind:this={zoomBounds}
                        style="left: {zoomBoundsX}px; top: {zoomBoundsY}px; width: {zoomBoundsWidth}px; height: {zoomBoundsHeight}px;"
                    />
                    
                    {#if graph.rootCohort}
                        <CohortWidget
                            cohort={graph.rootCohort}
                            bind:graph
                        />
                    {/if}
                </div>
            </div>
            

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