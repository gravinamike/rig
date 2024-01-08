<script lang="ts">
    // Import types.
    import type { PageData } from "./$types"
    import type { WaitingIndicatorStates } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants and utility functions.
    import { startingGraphDepth } from "$lib/shared/constants"
    import { onMobile } from "$lib/shared/utility"

    // Import stores.
    import { defaultFontStore, graphBackgroundColorStore, loadingState, perspectiveThingIdStore, userIdStore } from "$lib/stores"

    // Import page controller.
    import PageController from "./controller.svelte"

    // Import UI components.
    import { WaitingIndicator, ContextCommandPalette } from "$lib/widgets/layoutWidgets"
    import { LeftSideMenu } from "./leftSideMenu"
    import { 
        NewFileWidget, DirectionDropdownWidget, RemoteRelatingWidget, ThingLinkingWidget,
        RelationshipReorderController, TextHyperlinkingWidget
    } from "$lib/widgets/dialogWidgets"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    import { defaultGraphWidgetStyle, RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"



    export let data: PageData

    

    // User ID.
    userIdStore.set( data.user?.username || null )
    
    // HTML element attributes.
    let height: number


    // Attributes handled by page controller.
    let title = "Rig"
    let urlUsernameAndGraphFolder: string | null = null
    let urlThingId: number | null = null
    let urlSpaceId: number | null = null
    let leftMenuOpen: boolean = false
    let leftMenuLockedOpen: boolean = false
    let openedSubMenuName: string | null = null
    let lockedSubMenuName: string | null = null
    let rightMenuOpen: boolean = false
    let graphIndicatorStates: WaitingIndicatorStates = {}
    let graphBackgroundImageUrl: string | null = null
    let reorderOrientation: "row" | "column" | null = null
    let closeRightMenu: () => void = () => {}
    let handleMouseMove: (event: MouseEvent | TouchEvent) => void = () => {}
    let handleTouchStart: (event: TouchEvent) => void = () => {}


    // Attributes handled by the Graph Viewer.
    let graph: Graph | null
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    let allowZoomAndScrollToFit: boolean
    let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    let back: () => void
    let forward: () => void
    let setGraphSpace: (space: Space | number) => void
</script>


<!-- Page controller. -->
<PageController
    {graph}
    {rePerspectToThingId}
    {setGraphSpace}

    bind:title
    bind:urlUsernameAndGraphFolder
    bind:urlThingId
    bind:urlSpaceId
    bind:leftMenuOpen
    bind:leftMenuLockedOpen
    bind:openedSubMenuName
    bind:lockedSubMenuName
    bind:graphIndicatorStates
    bind:graphBackgroundImageUrl
    bind:reorderOrientation
    bind:handleMouseMove
    bind:handleTouchStart
/>


<!-- Set page title based on open Graph. -->
<svelte:head>
    <title>{title}</title>
</svelte:head>


<!-- Main app UI. -->
<main
    class:on-mobile={onMobile()}
    class:reorderRow={reorderOrientation === "row"}
    class:reorderColumn={reorderOrientation === "column"}

    bind:clientHeight={height}

    style="font-family: {$defaultFontStore || "Arial"};"
    
    on:mousemove={handleMouseMove}
    on:touchmove={
        (event) => {
            if ("touches" in event && event.touches.length > 1) event.preventDefault()
            handleMouseMove(event)
        }
    }
    on:touchstart={handleTouchStart}
>

    <!-- Graph background. -->
    {#if $loadingState === "graphLoaded"}
        <div
            class="background"
            class:color={!graphBackgroundImageUrl}
            class:image={graphBackgroundImageUrl}

            style={
                graphBackgroundImageUrl ? `background-image: url(${graphBackgroundImageUrl});` :
                `background-color: ${$graphBackgroundColorStore};`
            }
        />
    {/if}
    
    <!-- Front pane for context menus and command palettes. -->
    <ContextCommandPalette />

    <!-- Front pane for new file dialog. -->
    <NewFileWidget />

    <!-- Front pane for Relationship-being-created Widget. -->
    <RelationshipBeingCreatedWidget />

    <!-- Front pane for Remote-relating Widget. -->
    <RemoteRelatingWidget />

    <!-- Front panes for Thing-linking and text-hyperlinking Widgets. -->
    <ThingLinkingWidget />
    <TextHyperlinkingWidget />

    <!-- Dropdown menu for Direction-selecting widgets. -->
    <DirectionDropdownWidget />

    <!-- Controller for Relationship-reorder operations. -->
    <RelationshipReorderController />

    <!-- Side-menu. -->
    <LeftSideMenu
        {height}
        bind:graph
        {graphWidgetStyle}
        {allowZoomAndScrollToFit}
        {leftMenuOpen}
        {leftMenuLockedOpen}
        bind:openedSubMenuName
        {lockedSubMenuName}
        {rePerspectToThingId}
        {setGraphSpace}
    />

    <!-- Graph Portal. -->
    {#if $loadingState === "graphLoaded"}
        <GraphViewer
            pThingIds={[$perspectiveThingIdStore]}
            depth={startingGraphDepth}
            bind:graph
            bind:graphWidgetStyle
            bind:allowZoomAndScrollToFit
            bind:rightMenuOpen
            bind:closeRightMenu
            bind:rePerspectToThingId
            bind:back
            bind:forward
            bind:setGraphSpace
        />

        
    <!-- Waiting indicator. -->
    {:else}
        <WaitingIndicator
            states={graphIndicatorStates}
            currentStateName={$loadingState}
        />
    {/if}
</main>


<style>
    main {
        flex-grow: 1;

        height: 100%;
        max-height: 100%;

        display: flex;
        flex-direction: row;

        overflow: hidden;
    }

    :global(main.reorderRow *) {
        cursor: col-resize;
    }

    :global(main.reorderColumn *) {
        cursor: row-resize;
    }

    .background {
        position: absolute;
        width: 100vw;
        height: 100vh;
    }

    main.on-mobile .background {
        width: 100%;
        height: 100%;
    }

    .background.image {
        background-size: cover;
    }
</style>