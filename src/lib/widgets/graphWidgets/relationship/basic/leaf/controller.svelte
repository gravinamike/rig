<script lang="ts">
    // Import types.
    import type { Graph, GenerationMember, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import {
        storeGraphDbModels, addGraphIdsNeedingViewerRefresh,
        hoveredThingIdStore, relationshipBeingCreatedInfoStore,
        reorderingInfoStore, enableReordering, setReorderingDragStart
    } from "$lib/stores"

    // Import API methods.
    import { updateRelationships } from "$lib/db/clientSide"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide";
    
    
    /**
     * @param cohortMemberWithIndex -  Object containing the index and the Generation Member the widget is based on.
     * @param cohort - The Thing Cohort associated with this Relationship Cohort.
     * @param graph - The Graph which this Relationship is part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param thingIdOfHoveredRelationship - The ID of the Thing associated with any currently-hovered Relationship.
     * @param leafHovered - Whether or not the mouse is currently over the widget.
     * @param leafClicked - Whether or not the widget is currently clicked.
     * @param relatableForCurrentDrag - Whether the widget is a valid target for any current drag-relate operation.
     * @param thing - The Thing associated with this Relationship.
     * @param highlightLevel - The intensity with which to highlight the widget.
     * @param showDirection - Whether to display the Direction widget.
     * @param changeRelationshipDirection - Method to set the Relationship's Direction by ID.
     * @param handleMouseDown - Handler method for down-mouse-click.
     * @param handleBodyMouseMove - Handler method for mouse movement over the page body.
     * @param handleBodyMouseUp - Handler method for mouse-release over the page body.
     */
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let thingIdOfHoveredRelationship: number | null
    export let leafHovered: boolean
    export let leafClicked: boolean
    export let relatableForCurrentDrag: boolean
    export let thing: Thing
    export let highlightLevel: "no-highlight" | "soft-highlight" | "hard-highlight"
    export let showDirection: boolean
    export let changeRelationshipDirection: (directionId: number) => void
    export let handleMouseDown: (event: MouseEvent) => void
    export let handleBodyMouseMove: (event: MouseEvent) => void
    export let handleBodyMouseUp: (event: MouseEvent) => void
    


    /* --------------- Output attributes. --------------- */

    /**
     * Associated Thing.
     * 
     * The Thing associated with this Relationship.
     */
    $: thing = cohortMemberWithIndex.member.thing as Thing

    /**
     * Highlight level.
     * 
     * The strength of the highlight on the widget.
     */
    $: highlightLevel =
        // If... 
        (
            // ...the widget is clicked...  
            leafClicked && !$reorderingInfoStore.reorderInProgress
            // ...or the Relationship is being reordered...
            || $reorderingInfoStore.destThingId === cohortMemberWithIndex.member.thingId
        // The highlight is hard.
        ) ? "hard-highlight" :

        // Else, if...
        (
            // ...the widget, its parent Relationship widget, or the associated Thing are hovered...
            (leafHovered || relationshipHovered || thingHovered)
            // ...and the highlight is not being suppressed to indicate that this widget is
            // not relatable for a current drag-relate operation...
            && !(
                $relationshipBeingCreatedInfoStore.sourceThingId
                && !relatableForCurrentDrag
            )
        // The highlight is soft.

        ) ? "soft-highlight" :
        // Otherwise, the widget isn't highlighted.
        "no-highlight"

    /**
     * Show-Direction flag.
     * 
     * Indicates whether or not to show the Direction widget.
     */
    $: showDirection =
    // If...
        (
            // ...the mouse is over the Leaf widget or its parent Relationship widget...
            leafHovered || relationshipHovered
            // ...the widget is not a valid target for any in-progress drag-relate operation...
            && !($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag)
            // ...and no Relationship-reordering operation is in progress,
            && !$reorderingInfoStore.reorderInProgress
        // Show the Direction widget.
        ) ? true :
        // Otherwise, don't show the Direction widget.
        false

    /**
     * Change-Relationship-Direction method.
     * 
     * Changes the Relationship's Direction by ID.
     * 
     * @param directionId - The ID of the new Direction to assign to the Relationship.
     */
    changeRelationshipDirection = async (directionId: number) => {
        // Get the source and destination Thing IDs (abort if invalid).
        const sourceThingId = thing.parentThing?.id || null
        const destThingId = thing.id || null
        if ( !(sourceThingId && destThingId) ) return

        // Change the Relationship's Direction in the db.
        const relationshipsUpdated = await updateRelationships([
            {
                sourceThingId: sourceThingId,
                destThingId: destThingId,
                directionId: directionId
            }
        ])
        // If the db operation succeeded, refresh the Graph to reflect the new Direction.
        if (relationshipsUpdated) {
            await storeGraphDbModels<ThingDbModel>("Thing", sourceThingId, true)
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }

    /**
     * Handle-mouse-down method.
     * 
     * Handles tasks that should be executed when the mouse button is pressed
     * down on the Leaf (including recording the start od a drag).
     * @param event - The MouseEvent that triggered this method.
     */
    handleMouseDown = (event: MouseEvent) => {
        // Record the start of a drag operation to the Relationship-reordering
        // store.
        setReorderingDragStart(
            [event.clientX, event.clientY] as [number, number],
            graphWidgetStyle,
            cohort,
            cohortMemberWithIndex.member.thingId as number)
    }

    /**
     * Handle-body-mouse-move method.
     * 
     * Handles tasks that should be executed when the mouse is moved over the
     * page body (including Relationship-reordering drags).
     * @param event - The MouseEvent that triggered this method.
     */
    handleBodyMouseMove = (event: MouseEvent) => {
        const dragChangeX =
            $reorderingInfoStore.dragStartPosition ? event.clientX - $reorderingInfoStore.dragStartPosition[0] :
            null
        const dragChangeY =
            $reorderingInfoStore.dragStartPosition ? event.clientY - $reorderingInfoStore.dragStartPosition[1] :
            null
        
        // If...
        if (
            // ...there is a drag being tracked for this Relationship...
            $reorderingInfoStore.thingCohort === cohort
            && $reorderingInfoStore.destThingId === cohortMemberWithIndex.member.thingId
            // ...the drag has proceeded a certain distance...
            && dragChangeX && dragChangeY
            && Math.hypot(dragChangeX, dragChangeY) > 5
            // ...and there's not yet a reordering operation taking place...
            && !$reorderingInfoStore.reorderInProgress
        ) {
            // Initialize the Relationship-reordering store (starting
            // a Relationship-reordering operation.)
            enableReordering(
                $reorderingInfoStore.dragStartPosition as [number, number],
                graphWidgetStyle,
                cohort,
                cohortMemberWithIndex.index,
                cohortMemberWithIndex.member.thingId as number
            )
        }
    }

    /**
     * Handle-body-mouse-up method.
     * 
     * Handles tasks that should be executed when the mouse button is released
     * over the page body (including disabling the leaf-clicked flag).
     */
    handleBodyMouseUp = () => {
        leafClicked = false
    }
    

    /* --------------- Support attributes. --------------- */

    /**
     * Thing-hovered flag.
     * 
     * Whether the associated Thing widget (or any other widget
     * representing the same Thing) is being hovered over by the mouse.
     */
    $: thingHovered = thing.id === $hoveredThingIdStore

    /**
     * Relationship-hovered flag.
     * 
     * Whether the Relationship widget (or any other widget representing
     * the same Relationship) is being hovered over by the mouse.
     */
    $: relationshipHovered = thing.id && thing.id === thingIdOfHoveredRelationship
</script>