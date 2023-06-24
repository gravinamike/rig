<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Graph, Space } from "$lib/models/constructModels"

    // Import basic framework functions.
    import { onMount } from "svelte"
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import constants and utility functions.
    import { zoomBase } from "$lib/shared/constants"
    import { sleep, Rectangle, descendantElements, elementGroupEdges, onMobile } from "$lib/shared/utility"

    // Import stores.
    import { relationshipBeingCreatedInfoStore, reorderingInfoStore } from "$lib/stores"
    import { scrollElementToElement } from "$lib/shared/animation";


    /**
     * @param graph - The Graph that the widget is based on.
     * @param widget - The top-level <div> of the Graph Widget.
     * @param centralAnchor - A <div> in the center of the Graph Widget that serves as a central attachment point for the Graph.
     * @param zoomBoundsDiv - A <div> that closely hugs the edges of the Graph, used as a target for zooms.
     * @param graphWidgetStyle - Controls the style of the widget.
     * @param currentSpace - The current Space that is used when rendering the Graph.
     * @param showPlaneControls - Whether or not to display the Plane Controls widget.
     * @param scale - The target scale of the Graph Widget, used for zooming.
     * @param tweenedScale - A tweened version of the scale, used for animated zooming.
     * @param zoomBounds - A Rectangle that describes the zoomBoundsDiv, used to calculate zoom parameters.
     * @param allowZoomAndScrollToFit - Whether to allow automatic zooming and scrolling.
     * @param allowScrollToThingId - Whether to allow automated scrolling to a specified Thing.
     * @param thingIdToScrollTo - The ID of the target Thing for automated scrolling.
     * @param trackingMouse - Whether the position of the mouse is being tracked for dragging.
     * @param handleMouseMove - Function to mouse-drag the widget.
     * @param handleWheelScroll - Function to scroll-zoom the widget.
     */
    export let graph: Graph
    export let widget: HTMLElement | null
    export let centralAnchor: Element | null
    export let widgetWidth: number
    export let widgetHeight: number
    export let zoomBoundsDiv: Element | null
    export let graphWidgetStyle: GraphWidgetStyle
    
    export let currentSpace: Space | null
    export let showPlaneControls: boolean
    export let scale: number
    export let tweenedScale: Tweened<number>
    export let zoomBounds: Rectangle
    export let allowZoomAndScrollToFit: boolean
    export let allowScrollToThingId: boolean
    export let thingIdToScrollTo: number | null
    export let trackingMouse: boolean
    export let handleMouseMove: (event: MouseEvent | TouchEvent) => void
    export let handleTouchEnd: (event: TouchEvent) => void
    export let handleWheelScroll: (event: WheelEvent) => void


    /* --------------- Output attributes. --------------- */

    /**
     * Current Space.
     * 
     * If the Graph has a Starting Space defined, that is used. Otherwise, the
     * Perspective Thing's Space is used (or null if there isn't one).
     */
    $: currentSpace =
        graph.startingSpace ? graph.startingSpace :
        graph.pThing?.space || null

    /**
     * Show-Plane-controls flag.
     * 
     * This attribute controls whether the Plane controls widget is displayed,
     * and is true if there are any Planes besides the Plane of the Perspective
     * Thing.
     */
    $: showPlaneControls =
        Object.keys(graph.planes._members).length > 1 ? true :
        false

    /**
     * Scale.
     * 
     * This is the HTML scale of the widget, used to implement zooming. It is
     * derived from the application's base zoom factor, with the Graph style's
     * zoom factor exponentially increasing or decreasing it.
     */
    $: scale = zoomBase ** graphWidgetStyle.zoom

    /**
     * Tweened scale.
     * 
     * When animated zooming is enabled, the tweened scale provides a smoothly
     * interpolated version of the discrete scale.
     */
    tweenedScale = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedScale.set(scale)

    /**
     * Zoom bounds.
     * 
     * A Rectangle that describes the zoomBoundsDiv, used to calculate zoom
     * parameters. The Rectangle is in "scale-naive" space, calculated from the
     * Graph bounds.
     */
    zoomBounds = new Rectangle()

    /**
     * Tracking-mouse flag.
     * 
     * This attribute indicates whether the mouse position is being tracked for
     * the purposes of dragging the widget.
     */
    trackingMouse = false

    /**
     * Previous pinch size.
     * 
     * Tracks the distance between touch points on the last-recorded pinch.
     */
    let prevPinchSize: number | null = null

    /**
     * Pinch change.
     * 
     * The difference between the sizes of the current and last pinch.
     */
    let pinchChange: number
    

    /**
     * Mouse-move handler.
     * 
     * Drags the Graph Widget when left-mouse button is clicked and the mouse is
     * moving.
     */
    handleMouseMove = (event: MouseEvent | TouchEvent) => {
        // If this is a "pinch" touch gesture.,
        if ("touches" in event && event.touches.length === 2) {
            // Get the size of the pinch.
            const x1 = event.touches.item(0)?.clientX as number
            const y1 = event.touches.item(0)?.clientY as number
            const x2 = event.touches.item(1)?.clientX as number
            const y2 = event.touches.item(1)?.clientY as number
            const xDist = x2 - x1
            const yDist = y2 - y1
            const pinchSize = Math.hypot(xDist, yDist)

            // Determine how much the pinch changed from the previous pinch.
            pinchChange = prevPinchSize ? pinchSize - prevPinchSize : 0

            // If there is not a Relationship-drag operation in progress,
            if ($relationshipBeingCreatedInfoStore.sourceThingId === null) {
                // Calculate the new zoom.
                const newZoom = graphWidgetStyle.zoom + pinchChange * 0.02
                // If the new zoom would not exceed min and max zoom bounds, set zoom to the new zoom.
                if (-5 <= newZoom && newZoom <= 5) graphWidgetStyle.zoom = newZoom
            }

            // Set the pinch size as the previous pinch size.
            prevPinchSize = pinchSize

        // Otherwise.
        } else {

            // Get X and Y coordinates.
            const clientX = "clientX" in event ? event.clientX : event.touches.item(0)?.clientX as number
            const clientY = "clientY" in event ? event.clientY : event.touches.item(0)?.clientY as number

            // If mouse tracking has been engaged for at least 1 previous event...
            if (
                widget
                && trackingMouse
                && !$relationshipBeingCreatedInfoStore.trackingMouse
                && !$reorderingInfoStore.dragStartPosition
                && prevMouseTrackingLocation.x
                && prevMouseTrackingLocation.y
            ) {
                // ...calculate the distance components from the previous event,
                let deltaX = clientX - prevMouseTrackingLocation.x
                let deltaY = clientY - prevMouseTrackingLocation.y
                // and adjust the widget's X and Y scroll by those distances.
                widget.scrollLeft = (widget.scrollLeft - deltaX)
                widget.scrollTop = (widget.scrollTop - deltaY)
            }
            // Update mouse tracking with the current event's location.
            prevMouseTrackingLocation.x = clientX
            prevMouseTrackingLocation.y = clientY

        }
        
    }

    handleTouchEnd = (event: TouchEvent) => {
        prevMouseTrackingLocation.x = null
        prevMouseTrackingLocation.y = null
        prevPinchSize = null
        pinchChange = 0
    }

    /**
     * Wheel-scroll handler.
     * 
     * Zooms the Graph Widget (within allowed bounds) when the mouse wheel is
     * moved.
     */
    handleWheelScroll = (event: WheelEvent) => {
        // If there is not a Relationship-drag operation in progress,
        if ($relationshipBeingCreatedInfoStore.sourceThingId === null) {
            // Calculate the new zoom.
            const newZoom = graphWidgetStyle.zoom + event.deltaY * -0.005
            // If the new zoom would not exceed min and max zoom bounds, set zoom to the new zoom.
            if (-5 <= newZoom && newZoom <= 5) graphWidgetStyle.zoom = newZoom
        }
    }


    /* --------------- Initialization. --------------- */

    // Configure style for off-axis styling, if applicable.
    if (graph.offAxis) {
        graphWidgetStyle.excludePerspectiveThing = true
        graphWidgetStyle.excludeCartesianAxes = true
    }

    onMount(async () => {
        // Start the widget scrolled to center.
        scrollToCentralAnchor(false)
	})


    /* --------------- Reactive updating of primary attributes. --------------- */

    // Updating styling of the space between Things in a Thing Cohort.
    $: graphWidgetStyle.betweenThingSpacing = 0.01 * graphWidgetStyle.thingSpacingPercent * graphWidgetStyle.thingSize
    $: graphWidgetStyle.betweenThingGap = Math.max(0, graphWidgetStyle.betweenThingSpacing)
    $: graphWidgetStyle.betweenThingOverlap = Math.min(0, graphWidgetStyle.betweenThingSpacing)


    // Scrolling to a target Perspective Thing before the Perspective changes.
    $: if (allowScrollToThingId && thingIdToScrollTo) {
        scrollToThingId(thingIdToScrollTo)
    }

    // Scrolling and zooming after the Graph is re-built.
    $: if (centralAnchor && allowZoomAndScrollToFit) {
        scrollToCentralAnchor(false)
        allowZoomAndScrollToFit = false
        zoomAndScroll()
    }




    /* --------------- Supporting attributes. --------------- */

    /**
     * Previous mouse-tracking location.
     * 
     * The last position at which the mouse was tracked. Used to calculate
     * distance moved for dragging the widget.
     */
    let prevMouseTrackingLocation: { x: number | null, y: number | null } = { x: null, y: null }

    /**
     * Scroll-to-central-anchor function.
     * 
     * Scrolls the widget to its true center position (the central anchor).
     */
    async function scrollToCentralAnchor( smooth: boolean = true ): Promise<void> {
        // Scroll the central anchor into the center of the view.
        centralAnchor?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "center",
            inline: "center"
        })
    }
    
    /**
     * Scroll-to-Thing-ID function.
     * 
     * Scrolls the widget to center on a target Thing based on its ID.
     */
    async function scrollToThingId( thingId: number ): Promise<void> {
        // Get the HTML element for the given Thing ID.
        const thingWidgetId = `graph#${ graph.id }-thing#${ thingId }`
        let thingWidget = document.getElementById(thingWidgetId)

        // If no such element exists for that ID, get the HTML element for the
        // Thing-missing-from-store widget.
        if (!thingWidget) thingWidget = document.getElementsByClassName("thing-missing-from-store-widget")[0] as HTMLElement

        if (widget && thingWidget) {
            scrollElementToElement(widget, thingWidget, 100)
        }

        // Reset the flag that called for this operation.
        allowScrollToThingId = false
    }

    /**
     * Zoom-and-scroll function.
     * 
     * Zooms, then scrolls, the Graph Widget to fit and center the Graph.
     */
     async function zoomAndScroll() {

        // If either the width or height of the Graph widget is non-positive,
        // abort (to avoid a divide-by-zero error).
        if (widgetWidth <= 0 || widgetHeight <= 0) return


        await sleep(10) // Allow time for Graph re-draw before zooming.
        await zoomToFit()
        await sleep(100)
        await scrollToZoomBoundsCenter()
    }

    /**
     * Zoom-to-fit function.
     * 
     * Zooms the widget to fit the Graph.
     */
    async function zoomToFit(): Promise<void> {
        if (!widget) return

        // Update the Graph bounds.
        updateGraphBounds()
        
        // Set the zoom bounds from the Graph bounds, adjusting for both scale
        // and padding.
        zoomBounds.x = ( graphBounds.x / scale ) - graphWidgetStyle.zoomPadding
        zoomBounds.y = ( graphBounds.y / scale ) - graphWidgetStyle.zoomPadding
        zoomBounds.width = ( graphBounds.width / scale ) + ( 2 * graphWidgetStyle.zoomPadding )
        zoomBounds.height = ( graphBounds.height / scale ) + ( 2 * graphWidgetStyle.zoomPadding )

        // Determine the scale change factor. It's based on the ratio between the
        // widget's frame and the zoom bounds.
        const scaleChangeX = widget.getBoundingClientRect().width / (zoomBounds.width * scale)
        const scaleChangeY = widget.getBoundingClientRect().height / (zoomBounds.height * scale)
        const scaleChange = Math.min(scaleChangeX, scaleChangeY)

        // Determine the new scale, and set the Graph's zoom accordingly.
        const newScale = scaleChange * scale
        const newZoom = Math.log(newScale) / Math.log(1.45)
        graphWidgetStyle.zoom = newZoom
    }

    /**
     * Scroll-to-zoom-bounds-center function.
     * 
     * Scrolls the widget so that the Graph is centered.
     */
    async function scrollToZoomBoundsCenter(): Promise<void> {
        if (!zoomBoundsDiv) return

        // Update the Graph bounds.
        updateGraphBounds()

        // If animated zoom/scroll is enabled, smooth-scroll to center the zoom
        // bounds.
        if (widget && graphWidgetStyle.animateZoomAndScroll) {
            scrollElementToElement(widget, zoomBoundsDiv, 100)

        // Otherwise, discrete-scroll to center the zoom bounds.
        } else {
            zoomBoundsDiv.scrollIntoView({block: "center", inline: "center"})
        }
    }

    /**
     * Graph bounds.
     * 
     * A Rectangle describing the Graph as it's currently drawn in real screen-
     * space (taking scale into account).
     */
    const graphBounds = new Rectangle()

    /**
     * Update-Graph-bounds function.
     * 
     * Updates the Graph bounds for the current configuration of the Graph.
     */
    function updateGraphBounds() {
        if (!centralAnchor) return

        // Get all HTML elements in the Graph, except the zoom bounds element.
        const descendants = descendantElements(centralAnchor, true)
        const descendantThingElements = descendants.filter(
            element => {
                if (typeof element.className === "string") return (
                    element.className.includes("thing-widget")
                    || element.className.includes("direction-widget")
                    || element.className.includes("off-axis-relations-widget")
                )
            }
        )

        // Set the Graph Widget bounds (as the outer bounds of the above collection of elements).
        const descendantsEdges = elementGroupEdges(descendantThingElements)
        Object.assign(graphBounds, descendantsEdges)
        graphBounds.x = graphBounds.left - centralAnchor.getBoundingClientRect().x
        graphBounds.y = graphBounds.top - centralAnchor.getBoundingClientRect().y
        graphBounds.width = graphBounds.right - graphBounds.left
        graphBounds.height = graphBounds.bottom - graphBounds.top
    }
</script>