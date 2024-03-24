<script lang="ts">
    // Import types.
    import type { WaitingIndicatorStates } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"

    // Import basic framework resources.
    import { onMount } from "svelte"

    // Import UUID resources.
    import { v4 as uuidv4 } from "uuid"

    // Import stores and utility functions.
    import {
        devMode, fontNames, sessionUuidStore, loadingState, urlStore, 
        leftSideMenuStore, openGraphStore, graphBackgroundImageStore,
        updateMousePosition, updateRelationshipBeingCreatedEndpoint, landscapeOrientation, reorderingInfoStore
    } from "$lib/stores"
    import { onMobile, stringRepresentsInteger, urlHashToObject } from "$lib/shared/utility"
    
    // Import API methods.
    import { getFontNames } from "$lib/db"
    import { storeAppConfig } from "$lib/shared/config"
    import { openGraphFile } from "$lib/shared/unigraph"
    
    
    export let title: string
    export let graph: Graph | null
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let setGraphSpace: (space: Space | number) => void
    export let leftMenuOpen: boolean
    export let leftMenuLockedOpen: boolean
    export let openedSubMenuName: string | null
    export let lockedSubMenuName: string | null
    export let graphIndicatorStates: WaitingIndicatorStates
    export let urlUsernameAndGraphFolder: string | null
    export let urlThingId: number | null
    export let urlSpaceId: number | null
    export let graphBackgroundImageUrl: string | null
    export let reorderOrientation: "row" | "column" | null = null
    export let handleMouseMove: (event: MouseEvent | TouchEvent) => void = () => {}
    export let handleTouchStart: (event: TouchEvent) => void = () => {}
    


    /* --------------- Output attributes. --------------- */

    // Page title.
    title =
        $openGraphStore ? (
            $openGraphStore.startsWith("all/") ? $openGraphStore.replace("all/", "") :
            $openGraphStore
        ) :
        "Rig"


    /** Graph file and URL handling. */

    // Initialize open-Graph store.
    openGraphStore.set(null)

    // Graph parameters derived from the URL hash.
    let urlHashParams: { [key: string]: string } = {}
    $: urlHashParams = urlHashToObject($urlStore.hash)
    $: urlUsernameAndGraphFolder = "graph" in urlHashParams ? urlHashParams["graph"] : null
    $: urlThingId =
        "thingId" in urlHashParams && stringRepresentsInteger(urlHashParams["thingId"]) ? parseInt(urlHashParams["thingId"]) :
        null
    $: urlSpaceId = 
        "spaceId" in urlHashParams && stringRepresentsInteger(urlHashParams["spaceId"]) ? parseInt(urlHashParams["spaceId"]) :
        null

    // Set up reactive Graph loading when the Graph parameter in the URL
    // changes.
    function openGraphWhenURLChanges(urlUsernameAndGraphFolder: string | null) {
        if (urlUsernameAndGraphFolder === null || urlUsernameAndGraphFolder === $openGraphStore) return
        const [username, graphFolder] = urlUsernameAndGraphFolder.split("/")
        openGraph(username, graphFolder, null, true)
    }
    $: openGraphWhenURLChanges(urlUsernameAndGraphFolder)
        

    // Set up reactive re-Perspecting when the Thing ID parameter in the URL
    // changes.
    $: if (urlThingId) rePerspectIfAble(urlThingId)
    // Set up reactive Space assignment when the Space ID parameter in the URL
    // changes.
    $: if (urlSpaceId) setGraphSpaceIfAble(urlSpaceId)


    // Starting states for waiting indicator.
    graphIndicatorStates = {
        start: {
            text: "Configuration not loaded yet.",
            imageName: null
        },
        configLoading: {
            text: "Loading configuration...",
            imageName: "waiting"
        },
        configLoaded: {
            text: "No Graph loaded yet.",
            imageName: null
        },
        graphLoading: {
            text: "Loading Graph...",
            imageName: "waiting"
        },
        graphLoaded: {
            text: "Graph loaded!",
            imageName: null
        },
        error: {
            text: "Error loading Graph!",
            imageName: null
        }
    }


    /** Graph appearance. */

    // Background image URL.
    $: graphBackgroundImageUrl =
        $graphBackgroundImageStore ? `customizable/background-images/${$graphBackgroundImageStore}` :
        null


    /** Dialog widget attributes. */

    // Reorder-Relationship orientation (row or column).
    $: reorderOrientation = 
        $reorderingInfoStore.dragStartPosition === null ? null :
        $reorderingInfoStore.thingCohort?.rowOrColumn() === "row" ? "row" :
        $reorderingInfoStore.thingCohort?.rowOrColumn() === "column" ? "column" :
        null

    /**
     * Handle-mouse-move method.
     * 
     * Updates the mouse-position tracker and the endpoint for any in-progress
     * Relationship-creation operation.
     */
    handleMouseMove = ( event: MouseEvent | TouchEvent ) => {
        const clientX = "clientX" in event ? event.clientX : event.touches.item(0)?.clientX as number
        const clientY = "clientY" in event ? event.clientY : event.touches.item(0)?.clientY as number
        updateMousePosition( [clientX, clientY] )
        updateRelationshipBeingCreatedEndpoint( [clientX, clientY] )
    }

    /**
     * Handle-touch-start method.
     * 
     * Prevents single-touch events when multi-touch gestures, like pinch-zoom,
     * are happening.
     */
    handleTouchStart = (event) => {
        if ("touches" in event && event.touches.length > 1) {
            event.preventDefault()
            event.stopPropagation()
        }
    }



    /* --------------- Supporting attributes. --------------- */

    // Session UUID.
    sessionUuidStore.set( uuidv4() )

    
    /**
     * Load-app-config method.
     * 
     * Loads development-mode flag, font names and all config options stored
     * in the app-level config.json file.
     */
    async function loadAppConfig() {
        if (!mounted) return

        $loadingState = "configLoading"

        // Store development-mode flag.
        devMode.set(import.meta.env.MODE === "development")

        // Store font names.
        const apiFontNames = await getFontNames()
        if (apiFontNames) fontNames.set(apiFontNames)

        // Store app config.
        await storeAppConfig()
        
        $loadingState = "configLoaded"
    }

    /**
     * Open-Graph method.
     * 
     * Loads a Graph by filename, with the option to specify the starting
     * Perspective Thing as well.
     * @param graphName - The name of the Graph file to be opened.
     * @param pThingId - The ID of the Perspective Thing to start on, if not the Graph's default.
     */
    async function openGraph(username: string, graphName: string, pThingId: number | null = null, urlChanged=false) {
        if (!mounted) return

        // Close any existing Graph.
        graph = null

        // Open the Graph.
        await openGraphFile(username, graphName, pThingId, true, true)
    }


    function configureLeftSideMenuAfterStoreChanges(forceOpen=false) {
        leftMenuOpen = (!(onMobile() && !$landscapeOrientation) || forceOpen) && !!$leftSideMenuStore
        leftMenuLockedOpen = !!$leftSideMenuStore
        openedSubMenuName = $leftSideMenuStore || "File"
        lockedSubMenuName = $leftSideMenuStore
    }


    $: {
        $leftSideMenuStore

        configureLeftSideMenuAfterStoreChanges()
    }

    /**
     * Re-Perspect-if-able method.
     * Re-Perspects the Graph to the specified Thing ID if the app is ready.
     * @param pThingId - The ID of the target Perspective Thing.
     */
    function rePerspectIfAble(pThingId: number) {
        if (
            mounted
            && $loadingState === "graphLoaded"
            && graph?.pThing
            && graph.pThing.id !== pThingId
            && graph.pThing.id !== urlThingId
        ) rePerspectToThingId(pThingId)
    }
    
    /**
     * Set-Graph-Space-if-able method.
     * Sets the Graph's starting Space to the specified Space ID if the app is
     * ready.
     * @param spaceId - The ID of the target Space.
     */
    function setGraphSpaceIfAble(spaceId: number) {
        if (
            mounted
            && graph
            && graph.lifecycleStatus !== "building"
            && graph.pThing?.space?.id !== spaceId
        ) setGraphSpace(spaceId)
    }


    /** At app initialization, */
    let mounted = false
    onMount(async () => {
        mounted = true

        // Load the app config.
        await loadAppConfig()
        
        // Open the Graph currently specified in the store.
        if (urlUsernameAndGraphFolder) {
            const [username, graphFolder] = urlUsernameAndGraphFolder.split("/")
            await openGraph(username, graphFolder, urlThingId)
        } else {
            leftSideMenuStore.set("File")
            leftMenuOpen = !!$leftSideMenuStore
        }
	})
</script>