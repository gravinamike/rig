<script lang="ts">
    // Import types.
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import utility functions.
    import { onMobile, sleep, stringRepresentsInteger, updateUrlHash, urlHashToObject } from "$lib/shared/utility"

    // Import stores.
    import {
        devMode, addGraph, removeGraph, openGraphStore, perspectiveThingIdStore, hoveredThingIdStore,
        graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh,
        rightSideMenuStore,
        loadingState,
        urlStore,
        getGraphConstructs,
        perspectiveSpaceIdStore
    } from "$lib/stores"

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
    export let pThingIds: (number | null)[]
    export let depth: number

    export let graph: Graph | null = null
    export let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    export let allowZoomAndScrollToFit = false
    export let rightMenuOpen: boolean
    export let closeRightMenu: () => {}
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let back: () => void
    export let forward: () => void
    export let setGraphSpace: (space: Space | number) => void


    // Show-Graph flag. This is a kludge, to ensure that the Graph widgets are
    // completely replaced at each re-Perspect to prevent retention of state
    // information.
    let showGraph = false
    
    // Attributes controlling zoom and scroll.
    let allowScrollToThingId = false
    let thingIdToScrollTo: number | null = null

    // Right side-menu configuration.
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
    const defaultOpenSubMenuName = "Notes"
    let openedSubMenuName: string | null
    let rightMenuLockedOpen: boolean
    let lockedSubMenuName: string | null
    $: sideMenuWidth = 
        onMobile() ? 250 :
        (window.innerWidth - 250) * 0.5


    // Refresh the viewer whenever...
    // ...a Graph is opened...
    $: if ($loadingState === "graphLoaded") {
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
        graph = await addGraph(pThingIds as number[], depth, null, false, spaceToUse)
        graphWidgetStyle = {...defaultGraphWidgetStyle}
        await markThingsVisited(pThingIds as number[])

        rightMenuOpen = !!$rightSideMenuStore
        rightMenuLockedOpen = !!$rightSideMenuStore
        openedSubMenuName = $rightSideMenuStore
        lockedSubMenuName = $rightSideMenuStore

        await sleep(500) // Allow side-menu to open.

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
            await markThingsVisited(pThingIds as number[])
            perspectiveThingIdStore.set(thingId)

            graph.originalStartingSpace = null
            updateUrlHash({
                thingId: String(thingId)
            })



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
     * Set-Graph-Space method.
     * 
     * Re-builds the the Graph in a new Space.
     * @param space - The Space in which to rebuild the Graph.
     */
    setGraphSpace = async (space: Space | number) => {
        
        let spaceToUse: Space | null

        if (typeof space === "number") {
            spaceToUse = getGraphConstructs("Space", space) as Space | null
            if (!spaceToUse) {
                alert(`No Space with ID ${space} was found. Keeping current Space.`)
            }
        } else {
            spaceToUse = space
        }

        if (!spaceToUse) {
            // Revert URL to previous Space.
            updateUrlHash({
                spaceId: String($perspectiveSpaceIdStore)
            })
        } else if (graph && spaceToUse?.id) {
            updateUrlHash({
                spaceId: String(spaceToUse.id)
            })
            await graph.setSpace(spaceToUse as Space)

            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }
</script>


<!-- Graph viewer. -->
<div
    class="graph-viewer"
>

    <!-- Graph Widget -->
    <div
        class="graph-widget-container"
    >
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
        bind:open={rightMenuOpen}
        bind:lockedOpen={rightMenuLockedOpen}
        bind:lockedSubMenuName
        openWidth={sideMenuWidth}
        openTime={500}
        overlapPage={false}
        slideDirection={"left"}
        stateStore={rightSideMenuStore}
        bind:close={closeRightMenu}
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

        position: relative;
    }

    .graph-outline-widget-container {
        width: 100%;
        height: 100%;
        background-color: #fafafa;
    }
  </style>