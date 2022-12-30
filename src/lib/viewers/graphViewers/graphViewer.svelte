<script lang="ts">
    // Import types.
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import utility functions.
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { devMode, addGraph, removeGraph, hoveredThingIdStore, openGraphStore, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh, perspectiveThingIdStore } from "$lib/stores"

    // Import layout elements.
    import { SideMenu } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import { NotesViewer } from "$lib/viewers/notesViewers"
    import { FolderViewer } from "$lib/viewers/folderViewers"
    import { defaultGraphWidgetStyle, GraphWidget, GraphOutlineWidget } from "$lib/widgets/graphWidgets"

    // Import API functions.
    import { markThingsVisited } from "$lib/db/clientSide/makeChanges"
    import { saveGraphConfig } from "$lib/shared/config"
    

    /**
     * @param pThingIds - The IDs of the Graph's Perspective Things.
     * @param depth - The number of "steps" (related Things) to take when rendering the Graph.
     * @param graph - The Graph that the viewer is displaying.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param allowZoomAndScrollToFit - Whether or not to allow reactive zooming and scrolling after a re-Perspect.
     * @param rePerspectToThingId - Method to rebuild the Graph around a new Perspective Thing.
     * @param back - Method to navigate a step backwards in the Perspective history.
     * @param forward - Method to navigate a step forwards in the Perspective history.
     * @param setGraphSpace - Method to rebuild the Graph in a new Space.
     */
    export let pThingIds: number[]
    export let depth: number

    export let graph: Graph | null = null
    export let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    export let allowZoomAndScrollToFit = false
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let back: () => void
    export let forward: () => void
    export let setGraphSpace: (space: Space) => void

    // Show-Graph flag. This is a kludge, to ensure that the Graph widgets are
    // completely replaced at each re-Perspect to prevent retention of state
    // information.
    let showGraph = false

    // Attributes controlling zoom and scroll.
    let allowScrollToThingId = false
    let thingIdToScrollTo: number | null = null

    // Side-menu configuration.
    $: subMenuInfos = [
        [
            $devMode ?
                {
                    name: "Outline",
                    icon: "outline"
                } :
                null,
            {
                name: "Notes",
                icon: "notes"
            },
            $devMode ?
                {
                    name: "Attachments",
                    icon: "attachment"
                } :
                null
        ].filter(info => info !== null) as { name: string, icon: string }[]
    ]
    let openedSubMenuName: string | null
    const defaultOpenSubMenuName = "Notes"


    // Refresh the viewer whenever...
    // ...a Graph is opened...
    $: {
        $openGraphStore

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
        const selectedHistoryThingId = graph.history.entryWithThingAtPosition.thingId

        if (
            !rePerspectInProgressThingId
            && selectedHistoryThingId !== graph._pThingIds[0]
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

        // Open and build the new Graph.
        graph = await addGraph(pThingIds, depth)
        graphWidgetStyle = {...defaultGraphWidgetStyle}
        await markThingsVisited(pThingIds)

        // Refresh the Graph viewers.
        showGraph = true
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    // This indicates whether a re-Perspect operation is in progress but not yet completed.
    let rePerspectInProgressThingId: number | null = null

    /**
     * Re-Perspect-to-Thing-ID method.
     * 
     * Re-builds the the Graph using the given Thing ID as the Perspective Thing.
     * @param thingId - The ID of the new Perspective Thing.
     */
    rePerspectToThingId = async (thingId: number, updateHistory=true, zoomAndScroll=true) => {
        if (graph) {
            // Record that this re-Perspect operation is in progress.
            rePerspectInProgressThingId = thingId
            
            // If the new Perspective Thing is already in the Graph, scroll to center it.
            allowScrollToThingId = true
            thingIdToScrollTo = thingId

            // Allow for scroll time (since there's no actual feedback from the widget to `await`).
            await sleep(300) 

            // Re-Perspect the Graph.
            showGraph = false
            await graph.setPThingIds([thingId], updateHistory) // Re-Perspect to this Thing.
            showGraph = true

            // Clear the hovered-Thing highlighting.
            hoveredThingIdStore.set(null)

            // Refresh, then scroll and zoom to the new Graph.
            if (zoomAndScroll) allowZoomAndScrollToFit = true
            addGraphIdsNeedingViewerRefresh(graph.id)

            // Update Thing-visit records in the database, History, store and Graph configuration.
            await markThingsVisited(pThingIds)
            perspectiveThingIdStore.set(thingId)
            saveGraphConfig()

            // Record that the re-Perspect operation is finished.
            rePerspectInProgressThingId = null
        }
    }

    /**
     * Back method.
     * 
     * Navigates backwards one step in the Perspective history.
     */
    back = () => {
        if (graph) {
            graph.history.incrementPosition(-1)
            graph.history.position = graph.history.position // Needed for reactivity.
        }
    }

    /**
     * Forward method.
     * 
     * Navigates backwards one step in the Perspective history.
     */
    forward = () => {
        if (graph) {
            graph.history.incrementPosition(1)
            graph.history.position = graph.history.position // Needed for reactivity.
        }
    }

    /**
     * Handle-mouse-wheel method.
     * 
     * Allows for shift-scrolling the Perspective history.
     * @param event - The mouse-wheel event that triggered the method.
     */
     async function handleWheel(event: WheelEvent) {
        if (event.shiftKey) {
            if (event.deltaY > 0) {
                back()
            } else {
                forward()
            }
        }
    }

    /**
     * Set-Graph-Space method.
     * 
     * Re-builds the the Graph in a new Space.
     * @param space - The Space in which to rebuild the Graph.
     */
    setGraphSpace = async (space: Space) => {
        if (graph) {
            await graph.setSpace(space)

            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }
</script>


<!-- Handle mouse-wheel events over the page body. -->
<svelte:body lang="ts"
    on:wheel={handleWheel}
/>


<!-- Graph viewer. -->
<div class="graph-viewer">

    <!-- Graph Widget -->
    <div class="graph-widget-container">
        {#if graph && showGraph}
            <GraphWidget
                bind:graph
                bind:graphWidgetStyle
                {rePerspectToThingId}
                bind:allowZoomAndScrollToFit
                bind:allowScrollToThingId
                bind:thingIdToScrollTo
            />
        {/if}
    </div>

    <!-- Content side-menu. -->
    <SideMenu
        {subMenuInfos}
        {defaultOpenSubMenuName}
        bind:openedSubMenuName
        open={true}
        lockedOpen={true}
        openWidth={500}
        openTime={250}
        overlapPage={false}
        slideDirection={"left"}
    >
        <!-- Outline viewer. -->
        {#if openedSubMenuName === "Outline"}
            <div class="graph-outline-widget-container">
                {#if graph && showGraph}
                    <GraphOutlineWidget
                        bind:graph
                        {graphWidgetStyle}
                        {rePerspectToThingId}
                    />
                {/if}
            </div>

        <!-- Notes viewer. -->
        {:else if openedSubMenuName === "Notes"}
            {#if graph}
                <NotesViewer
                    {graph}
                    {rePerspectToThingId}
                />
            {/if}

        <!-- Attachments viewer. -->
        {:else if openedSubMenuName === "Attachments"}
            {#if graph}
                <FolderViewer
                    {graph}
                />
            {/if}
        {/if}
    </SideMenu>

</div>


<style>
    .graph-viewer {
        flex: 1 1 0;
        min-width: 0;

        position: relative;

        display: flex;
        flex-direction: row;
    }

    .graph-widget-container {
        flex: 1 1 0;
        min-width: 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
        background-color: #eef8ff;
    }

    .graph-outline-widget-container {
        width: 750px;
        height: 100%;
        background-color: #fafafa;
    }
  </style>