<script lang="ts">
    // Import types.
    import { tweened, type Tweened } from "svelte/motion"
    import { Rectangle } from "$lib/shared/utility"
    import type { Graph, Space } from "$lib/models/constructModels"

    // Import constants and utility functions.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

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
</script>


<GraphWidgetController
    {graph}
    {widget}
    {centralAnchor}
    {zoomBoundsDiv}
    {graphWidgetStyle}

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
    <div class="graph-backfield">

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
            {#if graph.rootCohort}
                <ThingCohortWidget
                    thingCohort={graph.rootCohort}
                    bind:graph
                    {graphWidgetStyle}
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