<script lang="ts">
    import { relationshipColorByHalfAxisId, type HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Thing } from "$lib/models/constructModels"

    // Import utility functions.
    import { sleep } from "$lib/shared/utility"

    /* Store imports. */
    import {
        graphDbModelInStore, unstoreGraphDbModels,
        hoveredThingIdStore, 
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated,
        setRelationshipBeingCreatedTrackingMouse,
        pinIdsStore, openContextCommandPalette, addPin, removePin,
        removeIdsFromThingSearchListStore,
        reorderingInfoStore,
        storeGraphDbModels,
        readOnlyMode,
        setHomeThingId,
        removeHomeThing,
        homeThingIdStore

    } from "$lib/stores"

    import { ThingBaseWidgetController } from "../base"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { updateThingPerspectiveText, updateThingText } from "$lib/db"
    import type { ThingDbModel } from "$lib/models/dbModels"

    /**
     * Create a Thing Widget Model.
     * @param {number} thingId - The ID of the Thing that the widget is based on.
     */
    export let thingId: number
    export let thing: Thing | null = null
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let perspectiveTexts: {[thingId: string]: string} = {}
    export let usePerspectiveText = false
    export let isHoveredWidget: boolean
    export let rePerspectToThingId: (id: number) => Promise<void>
        
    export let thingWidgetId: string = ""
    export let text = ""
    export let hasPerspectiveText = false
    export let highlighted = false
    export let shadowColor = "#000000"
    export let encapsulatingDepth: number = 0
    export let thingWidth: number = 0
    export let thingHeight: number = 0
    export let opacity = 1
    export let showPointer = true
    export let confirmDeleteBoxOpen = false
    export let relatableForCurrentDrag = false
    export let elongationCategory: "vertical" | "horizontal" | "neutral" = "neutral"
    export let isEncapsulating = false
    export let textFontSize = 10
    export let showDeleteButton = false
    export let editingText = false
    export let textBeingEdited: string = ""
    export let perspectiveTextBeingEdited: string | null = null
    export let handleMouseDown: (event: MouseEvent) => void
    export let handleMouseDrag: (event: MouseEvent) => void
    export let onBodyMouseUp: (event: MouseEvent) => void
    export let openCommandPalette: (event: MouseEvent) => void
    export let startDelete: () => void
    export let completeDelete: () => void
    export let beginEditingText: () => void = () => {}
    export let submitEditedText: () => void = () => {}
    export let cancelEditingText: () => void = () => {}


    // Attributes handled by the base widget controller.
    let planeId: number | null = null
    let cohortSize: number = 0
    let halfAxisId: HalfAxisId = 0
    let distanceFromFocalPlane: number = 0


    /* --------------- Output attributes. --------------- */

    /**
     * Thing Widget ID.
     * 
     * A unique ID for each Thing Widget, constructed from the Graph ID and the
     * Thing ID.
     */
    $: thingWidgetId = `graph#${ graph.id }-thing#${ thingId }`

    $: perspectiveText =
        String(thingId) in perspectiveTexts ? perspectiveTexts[String(thingId)] :
        null

    $: hasPerspectiveText = !!perspectiveText

    $: text =
        usePerspectiveText && perspectiveText ? perspectiveText :
        thing?.text || ""

    /**
     * Highlighted flag.
     * 
     * Indicates whether a visual highlight should be applied to the widget.
     */
    $: highlighted =
        // If...
        (
            // The Thing (either the widget or another instance) is hovered,
            isHoveredThing
            // And the widget is not relatable for any in-progress drag-relate
            // operation,
            && !(relationshipBeingCreated && !relatableForCurrentDrag)
            // And there is no reordering operation in progress,
            && !$reorderingInfoStore.reorderInProgress
        // Highlight the widget.
        ) ? true :
        // Else, don't highlight the widget.
        false
    
    /**
     * Shadow color.
     * 
     * The color of the widget's shadow. Determined by the half-axis.
     */
    $: shadowColor = relationshipColorByHalfAxisId[halfAxisId]

    /**
     * Opacity.
     * 
     * The opacity of the widget.
     */
    $: opacity =
        // If the Thing is on one of the encapsulating half-axes from its parent,
        // set the opacity to 1.
        [7, 8].includes(halfAxisId) ? 1 :
        // Otherwise, decrease the opacity as distance from the focal Plane
        // increases. Decrease opacity faster in the towards half-axis than in
        // the away half-axis.
        1 / ( 
            1
            + (
                distanceFromFocalPlane < 0 ? 1 :
                (distanceFromFocalPlane > 0 ? 2 : 0)
            )
            * Math.abs(distanceFromFocalPlane)
        )
    
    /**
     * Show-pointer flag.
     * 
     * Whether to show the mouse pointer when hovering over the widget. True if
     * the widget is in the currently-focused Plane and is not identified as not-
     * relatable if there is an in-progress drag-relation operation.
     */
    $: showPointer =
        distanceFromFocalPlane === 0
        && !(relationshipBeingCreated && !relatableForCurrentDrag)

    /**
     * Relatable-for-current-drag flag.
     * 
     * This attribute indicates whether the Thing is a valid target for relating
     * for the current drag-relate operation.
     */
     $: relatableForCurrentDrag =
        // The flag is true if...
        (
            // ...there is a drag-relate in progress...
            $relationshipBeingCreatedInfoStore.sourceThingId
            // ...and the source of the drag-relate is not *this* Thing.
            && $relationshipBeingCreatedInfoStore.sourceThingId !== thingId
        ) ?
            true :
            false

    /**
     * Is-encapsulating flag.
     * 
     * This attribute indicates whether the Thing is related to other Things on
     * the encapsulation axis. It is true if the Thing's half-axis is Inward, or
     * if it has child Thing Cohorts on the Outward half-axis.
     */
    $: isEncapsulating =
        thing && (halfAxisId === 8 || 7 in thing.childThingCohortByHalfAxisId) ? true :
        false

    /**
     * Text font size.
     * 
     * The pixel size of the font for the Thing text. This is taken from the
     * Graph style unless the Thing is "downwardly" encapsulated, in which case
     * the size is shrunk in order to fit.
     */
    $: textFontSize =
        encapsulatingDepth >= 0 ? graphWidgetStyle.thingTextSize :
        graphWidgetStyle.thingTextSize / Math.log2(cohortSize)

    /**
     * Show-delete-button flag.
     * 
     * Indicates whether to display the delete-Thing button. It is true if the
     * mouse is hovering over the widget, there is no Relationship-reordering
     * operation in progress, and the confirm-delete operation has not been
     * started.
     */
    $: showDeleteButton = !$readOnlyMode && isHoveredWidget && !$reorderingInfoStore.reorderInProgress && !confirmDeleteBoxOpen

    /**
     * Text-being-edited.
     * 
     * The text of the Thing when its text form is open and editable.
    */
    $: textBeingEdited = thing?.text || ""

    /**
     * Perspective-text-being-edited.
     * 
     * The Perspective text of the Thing when its text form is open and editable.
    */
    $: perspectiveTextBeingEdited = String(thingId) in perspectiveTexts ? perspectiveTexts[String(thingId)] : null

    /**
     * Handle-mouse-down method.
     * 
     * Handles mouse-down over the widget, setting the value of constructs
     * related to drag operations.
     * @param event - The mouse-down event that triggered the method.
     */
    handleMouseDown = (event: MouseEvent) => {
        // Set the start position of the drag operation.
        const position = [event.clientX, event.clientY] as [number, number]
        dragStartPosition = position
        // Set the Relationship-being-created store's tracking-mouse flag.
        setRelationshipBeingCreatedTrackingMouse(true)
    }

    /**
     * Handle-mouse-drag method.
     * 
     * Handles mouse movement related to the widget. Specifically, if a drag has
     * proceeded a certain distance from the widget, but the Relationship-being-
     * created has not yet been enabled, enables it.
     * @param event - The mouse-move event that triggered the method.
     */
    handleMouseDrag = (event: MouseEvent) => {
        if (
            thing?.parentCohort
            && dragStartPosition
            && Math.hypot(event.clientX - dragStartPosition[0], event.clientX - dragStartPosition[0]) > 5
            && !$relationshipBeingCreatedInfoStore.sourceThingId
        ) {
            enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                thingId,
                opacity,
                halfAxisId,
                thing.parentCohort.direction,
                dragStartPosition
            )
        }
    }

    /**
     * Handle-body-mouse-up method.
     * 
     * Handles mouse-up over the page body, setting the start position of the
     * drag operation to null.
     * @param event - The mouse-up event that triggered the method.
     */
    onBodyMouseUp = (event: MouseEvent) => {
        if (event.button === 0) {
            dragStartPosition = null
        }
    }

    /**
     * Open a context command palette for this Thing.
     * 
     * @param event - The right-click mouse event that triggered the context command palette.
     */
    openCommandPalette = (event: MouseEvent) => {
        const position = [event.clientX, event.clientY] as [number, number]
        const buttonInfos =[
                {
                    text: "Change Thing text",
                    iconName: "edit",
                    iconHtml: null,
                    isActive: false,
                    onClick: () => {beginEditingText()}
                },
                (
                    $pinIdsStore.includes(thingId) ? {
                        text: "Remove Thing from Pins",
                        iconName: "no-pin",
                        iconHtml: null,
                        isActive: false,
                        onClick: () => {removePin(thingId)}
                    } :
                    {
                        text: "Add Thing to Pins",
                        iconName: "pin",
                        iconHtml: null,
                        isActive: false,
                        onClick: () => {addPin(thingId)}
                    }
                ),
                (
                    $homeThingIdStore === thingId ? {
                        text: "Remove as Home-Thing",
                        iconName: "no-home",
                        iconHtml: null,
                        isActive: false,
                        onClick: () => {removeHomeThing()}
                    } :
                    {
                        text: "Make Home Thing",
                        iconName: "home",
                        iconHtml: null,
                        isActive: false,
                        onClick: () => {setHomeThingId(thingId)}
                    }
                )
            ]
        openContextCommandPalette(position, buttonInfos)
    }
    
    /**
     * Start-delete method.
     * 
     * Initiates a delete operation (which then needs to be confirmed to finish).
     */
    startDelete = async () => {
        confirmDeleteBoxOpen = true
    }

    /**
     * Complete-delete method.
     * 
     * Completes a delete operation after it has been confirmed.
     */
    completeDelete = async () => {
        // Delete the Thing in the Graph.
        await graph.deleteThingById(thingId)

        // Delete the Thing in the Graph construct stores.
        await unstoreGraphDbModels("Thing", thingId)

        // Delete the Thing in the History.
        const reverseHistory = graph.history._entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        for (const historyEntry of reverseHistory) {
            if (historyEntry.thingId !== thingId && graphDbModelInStore("Thing", historyEntry.thingId)) {
                rePerspectToThingId(historyEntry.thingId)
                break
            }
        }

        // Delete the Thing in the search list.
        await removeIdsFromThingSearchListStore(thingId)
    }

    beginEditingText = async () => {
        editingText = true
        // Allow the edit-text field to render.
        await sleep(50)
        const thingFormTextField = document.getElementById(`${thingWidgetId}-thing-change-text-field`) as HTMLInputElement | null
        thingFormTextField?.focus()
        thingFormTextField?.select()
    }

    submitEditedText = async () => {
        const pThingId = graph.pThing?.id as number
        await updateThingText(thingId, textBeingEdited)
        await updateThingPerspectiveText(pThingId, thingId, perspectiveTextBeingEdited || "")
        perspectiveTexts[thingId] = perspectiveTextBeingEdited || ""
        if (thing) thing.text = textBeingEdited
        perspectiveText = perspectiveTextBeingEdited
        // Refresh Thing IDs in the ThingDBModel store.
        await storeGraphDbModels<ThingDbModel>("Thing", [pThingId, thingId], true)
        editingText = false
    }

    cancelEditingText = () => {
        editingText = false
    }


    /* --------------- Output attributes. --------------- */

    /**
     * Is-hovered-Thing flag.
     * 
     * Indicates whether the mouse is hovered over the Thing (either this widget
     * or another widget representing the same Thing).
     */
    $: isHoveredThing = thingId === $hoveredThingIdStore

    /**
     * Relationship-being-created flag.
     * 
     * Indicates whether a create-Relationship operation is currently in
     * progress.
     */
    $: relationshipBeingCreated = $relationshipBeingCreatedInfoStore.sourceThingId ? true : false

    /**
     * Drag start position.
     * 
     * The starting point of an in-progress drag operation (or null).
     */
    let dragStartPosition: [number, number] | null = null
</script>


<!-- Base widget controller. -->
<ThingBaseWidgetController
    {thing}
    {graph}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:cohortSize
    bind:distanceFromFocalPlane
    bind:elongationCategory
/>