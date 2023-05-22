<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants and utility functions.
    import { tweened } from "svelte/motion"
    import { legacyPerspectiveThingsParse, Rectangle } from "$lib/shared/utility"

    // Import stores.
    import { relationshipBeingCreatedInfoStore } from "$lib/stores"

    // Import widget controller.
    import GraphWidgetController from "./controller.svelte"

    // Import sub-widgets.
    import SpaceFrameWidget from "./spaceFrame.svelte"
    import PlaneControls from "./planeControls.svelte"
    import { ThingCohortWidget } from "$lib/widgets/graphWidgets"
    import { cubicOut } from "svelte/easing";
    
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>
    export let allowZoomAndScrollToFit: boolean
    export let allowScrollToThingId: boolean
    export let thingIdToScrollTo: number | null


    // Variables handled by widget controller.
    let currentSpace: Space | null = null
    let showPlaneControls = false
    let scale = 1
    let tweenedScale: Tweened<number> = tweened( 1, { duration: 100, easing: cubicOut } )
    let zoomBounds: Rectangle = new Rectangle()
    let trackingMouse = false
    let handleMouseMove: (event: MouseEvent) => void
    let handleWheelScroll: (event: WheelEvent) => void

    // HTML element handles.
    let widget: HTMLElement | null = null
    let centralAnchor: Element | null = null
    let zoomBoundsDiv: Element | null = null

    let perspectiveTexts = legacyPerspectiveThingsParse(graph.pThing?.perspectivetexts || "{}")


    // Auto-center the current focal point after resizing the Graph.
    let widgetWidth: number
    let widgetHeight: number
    let lastWidgetWidth: number | null = null
    let lastWidgetHeight: number | null = null
    let widgetWidthChange = 0
    let widgetHeightChange = 0

    async function processWidgetResize(widgetWidth: number, widgetHeight: number) {
        if (lastWidgetWidth) widgetWidthChange = widgetWidth - lastWidgetWidth
        if (lastWidgetHeight) widgetHeightChange = widgetHeight - lastWidgetHeight

        const xAdjustment = -widgetWidthChange / 2
        const yAdjustment = -widgetHeightChange / 2
        widget?.scrollBy(xAdjustment, yAdjustment)

        lastWidgetWidth = widgetWidth
        lastWidgetHeight = widgetHeight
    }

    $: processWidgetResize(widgetWidth, widgetHeight)
</script>


<GraphWidgetController
    {graph}
    {widget}
    {centralAnchor}
    {zoomBoundsDiv}
    bind:graphWidgetStyle

    bind:currentSpace
    bind:showPlaneControls
    bind:scale
    bind:tweenedScale
    bind:zoomBounds
    bind:allowZoomAndScrollToFit
    bind:allowScrollToThingId
    bind:thingIdToScrollTo
    bind:trackingMouse
    bind:handleMouseMove
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
    on:mouseup={() =>
        trackingMouse = false
    }
    on:mousemove={handleMouseMove}
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
            
            <!-- Root Cohort Widget (from which the rest of the Graph automatically "grows"). -->
            {#if graph.rootCohort && graph.lifecycleStatus === "built"}
                <ThingCohortWidget
                    thingCohort={graph.rootCohort}
                    cohortMembersToDisplay={graph.rootCohort.members}
                    bind:graph
                    {graphWidgetStyle}
                    bind:perspectiveTexts
                    {rePerspectToThingId}
                />
            {/if}

        </div>

    </div>
    
    <!-- Plane controls. -->
    {#if showPlaneControls}

        <div class="plane-controls-container">
            <PlaneControls
                bind:graph
            />
        </div>

    {/if}

    <!-- Space frame. -->
    <SpaceFrameWidget
        bind:graph
        {graphWidgetStyle}
        {currentSpace}
    />
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

    .plane-controls-container {
        border-radius: 5px;
        box-shadow: 5px 5px 10px 2px lightgray;

        position: absolute;
        left: 20px;
        bottom: 20px;
    }
  </style>