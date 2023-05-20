<script lang="ts">
    // Import types.
    import type { PageData } from "./$types"
    import type { WaitingIndicatorStates } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants.
    import { startingGraphDepth } from "$lib/shared/constants"

    // Import stores.
    import {
        loadingState, openGraphStore, perspectiveThingIdStore,
        reorderingInfoStore, userIdStore
    } from "$lib/stores"

    // Import page controller.
    import PageController from "./controller.svelte"

    // Import side menu.
    import { LeftSideMenu } from "./leftSideMenu"

    // Import widgets.
    import { WaitingIndicator, ContextCommandPalette } from "$lib/widgets/layoutWidgets"
    import { 
        NewFileWidget, RemoteRelatingWidget, ThingLinkingWidget, TextHyperlinkingWidget,
        RelationshipReorderController
    } from "$lib/widgets/dialogWidgets"

    // Import viewers.
    import { GraphViewer } from "$lib/viewers/graphViewers"

    // Import related widgets.
    import { defaultGraphWidgetStyle, RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"


    export let data: PageData


    // User ID.
    userIdStore.set( data.user?.username || null )
    
    // HTML element attributes.
    let height: number


    // Attributes handled by page controller.
    let graphIndicatorStates: WaitingIndicatorStates = {}
    let leftMenuOpen: boolean = false
    let leftMenuLockedOpen: boolean = false
    let openedSubMenuName: string | null = null
    let lockedSubMenuName: string | null = null
    let rightMenuOpen: boolean = false
    let urlUsernameAndGraphFolder: string | null = null
    let urlThingId: number | null = null
    let urlSpaceId: number | null = null
    let graphBackgroundImageUrl: string | null = null
    let closeRightMenu: () => void = () => {}
    let handleMouseMove: (event: MouseEvent) => void = () => {}


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

    bind:leftMenuOpen
    bind:leftMenuLockedOpen
    bind:openedSubMenuName
    bind:lockedSubMenuName
    bind:graphIndicatorStates
    bind:urlUsernameAndGraphFolder
    bind:urlThingId
    bind:urlSpaceId
    bind:graphBackgroundImageUrl
    bind:handleMouseMove
/>


<!-- Set page title based on open Graph. -->
<svelte:head>
    <title>{
        $openGraphStore ? (
            $openGraphStore.startsWith("all/") ? $openGraphStore.replace("all/", "") : $openGraphStore
        ) :
        "Rig"
    }</title>
</svelte:head>


<!-- Main app UI. -->
<main
    class:reorderRow={
        $reorderingInfoStore.dragStartPosition !== null
        && $reorderingInfoStore.thingCohort?.rowOrColumn() === "row"
    }
    class:reorderColumn={
        $reorderingInfoStore.dragStartPosition !== null
        && $reorderingInfoStore.thingCohort?.rowOrColumn() === "column"
    }

    bind:clientHeight={height}
    
    on:mousemove={handleMouseMove}
>

    <!-- Graph background image. -->
    {#if $loadingState === "graphLoaded"}
        <div
            class="background-image"

            style={
                graphBackgroundImageUrl ? `
                    background-image: url(${graphBackgroundImageUrl});
                    background-size: cover;
                ` :
                `background-color: #eef8ff;`
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

    <!-- Controller for Relationship-reorder operations. -->
    <RelationshipReorderController />

    <!-- Side-menu. -->
    <LeftSideMenu
        {height}
        {graph}
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

        font-family: Arial;
    }

    :global(main.reorderRow *) {
        cursor: col-resize;
    }

    :global(main.reorderColumn *) {
        cursor: row-resize;
    }

    .background-image {
        position: absolute;
        width: 100vw;
        height: 100vh;
    }
</style>