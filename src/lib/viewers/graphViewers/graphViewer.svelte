<script lang="ts">
    // Import types.
    import type { MenuName } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import utility functions.
    import { onMobile, stringRepresentsInteger, sleep, urlHashToObject, updateUrlHash } from "$lib/shared/utility"

    // Import stores.
    import {
        devMode, landscapeOrientation, uITrimColorStore, uIHeaderColorStore, graphBackgroundImageStore,
        urlStore, loadingState, rightSideMenuStore, openGraphStore, addGraph, removeGraph,
        getGraphConstructs, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh,
        removeGraphIdsNeedingViewerRefresh, homeThingIdStore,
        perspectiveThingIdStore, perspectiveSpaceIdStore, hoveredThingIdStore, storeGraphDbModels

    } from "$lib/stores"

    // Import layout elements.
    import { SideMenu, Tooltip } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import { defaultGraphWidgetStyle, GraphWidget, GraphOutlineWidget } from "$lib/widgets/graphWidgets"
    import { FolderViewer } from "$lib/viewers/folderViewers"
    import { NotesViewer } from "$lib/viewers/notesViewers"

    // Import API functions.
    import { markThingsVisited, updateThingDefaultContentViewer } from "$lib/db/makeChanges"
    import { saveGraphConfig } from "$lib/shared/config"    
    import NotesEditor from "../notesViewers/notesEditor.svelte";
    import type { ThingDbModel } from "$lib/models/dbModels";


    
    /**
     * @param pThingIds - The IDs of the Graph's Perspective Things.
     * @param depth - The number of "steps" (related Things) to take when rendering the Graph.
     * @param graph - The Graph that the viewer is displaying.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param allowZoomAndScrollToFit - Whether or not to allow reactive zooming and scrolling after a re-Perspect.
     * @param rightMenuOpen - Whether or not the right-hand side-menu is open.
     * @param closeRightMenu - Method to close the right-hand side-menu.
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
    export let closeRightMenu: () => void
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let back: () => void
    export let forward: () => void
    export let setGraphSpace: (space: Space | number) => void



    // Component dimensions.
    let width = 1


    // Show-Graph flag. This is a kludge, to ensure that the Graph widgets are
    // completely replaced at each re-Perspect to prevent retention of state
    // information.
    let showGraph = false

    // Whether to use the mobile portrait layout.
    $: usePortraitLayout = onMobile() && !$landscapeOrientation
    
    // Attributes controlling zoom and scroll.
    let allowScrollToThingId = false
    let thingIdToScrollTo: number | null = null

    // Right side-menu configuration.
    $: subMenuInfos = [
        [
            {
                name: "Notes",
                icon: "notes",
                tooltipText: "Notes"
            },
            {
                name: "Outline",
                icon: "outline",
                tooltipText: "Outline"
            },
            $devMode ?
                {
                    name: "Attachments",
                    icon: "attachment",
                    tooltipText: "Attachments"
                } :
                null
        ].filter(info => info !== null) as { name: MenuName, icon: string, tooltipText: string | null }[]
    ]
    const defaultOpenSubMenuName = "Notes"
    let openedSubMenuName: string | null
    let rightMenuLockedOpen: boolean
    let lockedSubMenuName: string | null
    $: sideMenuExtension =
        usePortraitLayout ? window.innerHeight * 0.5 :
        onMobile() ? (window.innerWidth - 187) * 0.5 :
        (window.innerWidth - 250) * 0.5
    let sideMenuFullSize = false
    $: sideMenuFullSizeExtension =
        usePortraitLayout ? window.innerHeight :
        onMobile() ? width :
        null

    $: if ($loadingState === "graphLoaded") {
        $openGraphStore

        initializeSideMenusForGraph()
    }

    function initializeSideMenusForGraph() {
        // Set information about the state of the side-menus.
        rightMenuOpen = !!$rightSideMenuStore
        rightMenuLockedOpen = !!$rightSideMenuStore
        openedSubMenuName = $rightSideMenuStore || "Notes"
        lockedSubMenuName = $rightSideMenuStore
    }




    /**
     * Re-Perspect-to-Thing-ID method.
     * 
     * Re-builds the the Graph using the given Thing ID as the Perspective Thing.
     * @param thingId - The ID of the new Perspective Thing.
     */
    rePerspectToThingId = async (thingId: number, updateHistory=true, zoomAndScroll=true) => {
        if (graph) {
            // Record that this re-Perspect operation is in progress.
            graph.rePerspectInProgressThingId = thingId

            // If the new Perspective Thing is already in the Graph, scroll to center it.
            allowScrollToThingId = true
            thingIdToScrollTo = thingId

            // Allow for scroll time (since there's no actual feedback from the widget to `await`).
            await sleep(150)

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

            // Set the content pane to the default content viewer for the Perspective Thing.
            openedSubMenuName =
                graph.pThing?.defaultcontentviewer === "notes" ? "Notes" :
                graph.pThing?.defaultcontentviewer === "outline" ? "Outline" :
                graph.pThing?.defaultcontentviewer === "attachments" ? "Attachments" :
                null

            // Set the Graph's original starting Space to null.
            graph.originalStartingSpace = null

            // Update the URL to reflect the new Perspective Thing.
            updateUrlHash({
                thingId: String(thingId)
            })

            // Save the Graph configuration.
            saveGraphConfig()

            // Record that the re-Perspect operation is finished.
            graph.rePerspectInProgressThingId = null
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
        // Get the Space to use (either the supplied Space or the Space that matches the supplied
        // number.)
        let spaceToUse: Space | null
        if (typeof space === "number") {
            spaceToUse = getGraphConstructs("Space", space) as Space | null
            if (!spaceToUse) {
                alert(`No Space with ID ${space} was found. Keeping current Space.`)
            }
        } else {
            spaceToUse = space
        }

        // If the Space to use is null, revert URL to the previous Space.
        if (!spaceToUse) {
            updateUrlHash({
                spaceId: String($perspectiveSpaceIdStore)
            })

        // Otherwise, update the URL for the new Space, set the Space as the Graph's Perspective
        // Space, and refresh the Graph.
        } else if (graph && spaceToUse?.id) {
            updateUrlHash({
                spaceId: String(spaceToUse.id)
            })
            await graph.setSpace(spaceToUse as Space)

            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }



    $: spaceToUseForGraphOutliner =
        graph?.startingSpace ? graph.startingSpace :
        graph?.pThing?.space || null




    async function updateDefaultContentViewerForPThing(openedSubMenuName: string | null) {
        if (!graph?.pThing?.id) return

        if (openedSubMenuName === "Notes" && graph.pThing.defaultcontentviewer !== "notes") {
            graph.pThing.defaultcontentviewer = "notes"
            await updateThingDefaultContentViewer(graph.pThing.id, "notes")
            await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id, true)
        } else if (openedSubMenuName === "Outline" && graph.pThing.defaultcontentviewer !== "outline") {
            graph.pThing.defaultcontentviewer = "outline"
            await updateThingDefaultContentViewer(graph.pThing.id, "outline")
            await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id, true)
        } else if (openedSubMenuName === "Attachments" && graph.pThing.defaultcontentviewer !== "attachments") {
            graph.pThing.defaultcontentviewer = "attachments"
            await updateThingDefaultContentViewer(graph.pThing.id, "attachments")
            await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id, true)
        }
    }
    $: updateDefaultContentViewerForPThing(openedSubMenuName)

</script>


<!-- Graph viewer. -->
<div
    class="graph-viewer"

    bind:clientWidth={width}

    style="flex-direction: {usePortraitLayout ? "column-reverse" : "row"};"
>

    <!-- Graph Widget -->
    <div
        class="graph-widget-container"
    >
        <GraphWidget
            bind:pThingIds
            bind:depth
            bind:graph
            bind:graphWidgetStyle
            bind:showGraph
            {rePerspectToThingId}
            bind:allowZoomAndScrollToFit
            bind:allowScrollToThingId
            bind:thingIdToScrollTo
        />
    </div>

    <!-- Content side-menu. -->
    <SideMenu
        {subMenuInfos}
        {defaultOpenSubMenuName}
        bind:openedSubMenuName
        bind:open={rightMenuOpen}
        bind:lockedOpen={rightMenuLockedOpen}
        bind:lockedSubMenuName
        openExtension={sideMenuExtension}
        fullSizeExtension={sideMenuFullSizeExtension}
        bind:fullSize={sideMenuFullSize}
        openTime={500}
        overlapPage={false}
        slideDirection={ usePortraitLayout ? "down" : "left" }
        stateStore={rightSideMenuStore}
        bind:close={closeRightMenu}
    >
        <!-- Outline viewer. -->
        {#if openedSubMenuName === "Outline"}
            <div class="graph-outline-widget-container">
                {#if spaceToUseForGraphOutliner}
                    <GraphOutlineWidget
                        space={spaceToUseForGraphOutliner}
                        {pThingIds}
                        {depth}
                        fullSize={sideMenuFullSize}
                        {rePerspectToThingId}
                    />
                {/if}
            </div>

        <!-- Notes viewer. -->
        {:else if openedSubMenuName === "Notes"}
            {#if graph}
                <NotesViewer
                    {graph}
                    fullSize={sideMenuFullSize}
                    activeNotesEditorForOutliner={null}
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

    <!-- Home/back/forward buttons. -->
    <div
        class="nav-buttons"
        class:graph-background-image={$graphBackgroundImageStore !== null}

        style="border-right: solid 1px {$uIHeaderColorStore}; background-color: {$uITrimColorStore};"
    >
        <!-- Forward button. -->
        <div
            class="nav-button"

            on:click={forward}
            on:keydown={()=>{}}
        >
            <svg>
                <polygon points="9,6 9,19 19,12.5" />
            </svg>

            <Tooltip
                text={"Go forward in history."}
                direction={"up"}
                lean={"right"}
            />
        </div>

        <!-- Back button. -->
        <div
            class="nav-button"

            on:click={back}
            on:keydown={()=>{}}
        >
            <svg style="transform: rotate(180deg);">
                <polygon points="9,6 9,19 19,12.5" />
            </svg>

            <Tooltip
                text={"Go back in history."}
                direction={"up"}
                lean={"right"}
            />
        </div>

        <!-- Home button. -->
        {#if $homeThingIdStore}
            <div
                class="nav-button"

                on:click={() => { if ($homeThingIdStore) rePerspectToThingId($homeThingIdStore) }}
                on:keydown={()=>{}}
            >
                <img
                    src="./icons/home.png"
                    alt="Home indicator"
                >

                <Tooltip
                    text={"Go to home Thing."}
                    direction={"up"}
                    lean={"right"}
                />
            </div>
        {/if}
    </div>
</div>


<style>
    .graph-viewer {
        flex: 1 1 0;
        min-width: 0;
        min-height: 0;

        position: relative;

        display: flex;
    }

    .graph-widget-container {
        flex: 1 1 0;
        min-width: 0;
        min-height: 0;

        position: relative;
    }

    .nav-buttons {
        box-shadow: 3px 2px 2px 0px rgb(220, 220, 220);
        border-radius: 0 16px 0 0;

        position: absolute;
        left: -1px;
        bottom: 0;
        z-index: 100;

        display: flex;
        flex-direction: column;
        padding: 5px 5px 8px 3px;
        gap: 8px;
    }

    .nav-buttons.graph-background-image {
        box-shadow: 2px 2px 2px 0px rgb(160, 160, 160);
    }

    .nav-button {
        border-radius: 50%;

        box-sizing: border-box;
        position: relative;
        width: 25px;
        height: 25px;
        background-color: white;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .nav-button:hover {
        background-color: whitesmoke;
    }

    .nav-button:active {
        background-color: gainsboro;
    }

    .nav-button img {
        margin-top: -1px;

        width: 21px;
        height: 21px;
        opacity: 51%;
    }

    .nav-button svg {
        width: 25px;
        height: 25px;
        stroke: grey;
        fill: grey;
    }

    .graph-outline-widget-container {
        width: 100%;
        height: 100%;
        background-color: #fafafa;
    }
  </style>