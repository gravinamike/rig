<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { HistoryEntry } from "$lib/models/constructModels/graph/historyUtility"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { CommandButtonInfo } from "$lib/widgets/layoutWidgets"

    // Import constants.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Import stores.
    import {
        graphDbModelInStore, storeGraphDbModels, unstoreGraphDbModels,
        readOnlyMode, hoveredThingIdStore, reorderingInfoStore,
        openContextCommandPalette, pinIdsStore, addPin, removePin, homeThingIdStore, setHomeThingId, removeHomeThing,
        removeIdsFromThingSearchListStore, removeIdsFromNoteSearchListStore,
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated, setRelationshipBeingCreatedTrackingMouse,
        hoveredRelationshipTarget, setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated
    } from "$lib/stores"

    // Import utility functions.
    import { elementUnderTouchEvent, onMobile, sleep } from "$lib/shared/utility"

    // Import base Thing Widget controller.
    import { ThingBaseWidgetController } from "../base"
    
    // Import API methods.
    import { updateThingPerspectiveText, updateThingText } from "$lib/db"
    


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
    export let showText = true
    export let textFontSize = 10
    export let sliderOpen = false
    export let sliderPercentage = 100
    export let showDeleteButton = false
    export let editingText = false
    export let textBeingEdited: string = ""
    export let perspectiveTextBeingEdited: string | null = null
    export let handleMouseDown: (event: MouseEvent | TouchEvent) => void = () => {}
    export let handleMouseDrag: (event: MouseEvent | TouchEvent) => void = () => {}
    export let onBodyMouseUp: (event: MouseEvent | TouchEvent) => void = () => {}
    export let onMouseEnter: () => void = () => {}
    export let onMouseLeave: () => void = () => {}
    export let onClick: (event: MouseEvent) => void = () => {}
    export let onMouseUp: () => void = () => {}
    export let onTouchEnd: (event: TouchEvent) => void = () => {}
    export let openCommandPalette: (event: MouseEvent) => void = () => {}
    export let startDelete: () => void = () => {}
    export let completeDelete: () => void = () => {}
    export let toggleSlider: () => void = () => {}
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
     * Use-Perspective-text flag.
     * 
     * Indicates whether to use the Perspective-specific text (instead of the Thing's default text).
     */
    $: usePerspectiveText = !sliderOpen
    
    /**
     * Thing Widget ID.
     * 
     * A unique ID for each Thing Widget, constructed from the Graph ID and the
     * Thing ID.
     */
    $: thingWidgetId = `graph#${ graph.id }-thing#${ thingId }`

    /**
     * Thing text.
     * 
     * The main text of the Thing, either derived from the Thing's database record or replaced by a
     * Perspective-specific alternative. 
     */
    $: text =
        usePerspectiveText && perspectiveText ? perspectiveText :
        thing?.text || ""

    /**
     * Has-Perspective-text flag.
     * 
     * Indicates whether this Thing has Perspective-specific alternative text.
     */
    $: hasPerspectiveText = !!perspectiveText

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
    $: shadowColor = "grey"

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
    $: showDeleteButton = !onMobile() && !$readOnlyMode && isHoveredWidget && !$reorderingInfoStore.reorderInProgress && !confirmDeleteBoxOpen

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
    handleMouseDown = (event: MouseEvent | TouchEvent) => {
        // Get X and Y coordinates.
        const clientX = "clientX" in event ? event.clientX : event.touches.item(0)?.clientX as number
        const clientY = "clientY" in event ? event.clientY : event.touches.item(0)?.clientY as number
        // Set the start position of the drag operation.
        const position = [clientX, clientY] as [number, number]
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
    handleMouseDrag = (event: MouseEvent | TouchEvent) => {
        // Get X and Y coordinates.
        const clientX = "clientX" in event ? event.clientX : event.touches.item(0)?.clientX as number
        const clientY = "clientY" in event ? event.clientY : event.touches.item(0)?.clientY as number

        if (
            thing?.parentThingCohort
            && dragStartPosition
            && Math.hypot(clientX - dragStartPosition[0], clientX - dragStartPosition[0]) > 5
            && !$relationshipBeingCreatedInfoStore.sourceThingId
        ) {
            enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                thingId,
                opacity,
                halfAxisId,
                thing.parentThingCohort.direction,
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
    onBodyMouseUp = (event: MouseEvent | TouchEvent) => {
        if ("touches" in event || event.button === 0) {
            dragStartPosition = null
        }
    }

    /**
     * On-mouse-enter method.
     * 
     * Handles mouse entry into the Thing widget, setting hovered-Thing stores and flags.
     */
    onMouseEnter = () => {
        hoveredThingIdStore.set(thingId)
        isHoveredWidget = true
        hoveredRelationshipTarget.set(thing)
    }

    /**
     * On-mouse-leave method.
     * 
     * Handles mouse exit from the Thing widget, un-setting hovered-Thing and confirm-delete-box
     * stores and flags.
     */
    onMouseLeave = () => {
        hoveredThingIdStore.set(null)
        isHoveredWidget = false
        confirmDeleteBoxOpen = false
        hoveredRelationshipTarget.set(null)
    }

    /**
     * On-click method.
     * 
     * Handles mouse clicks on the Thing Widget, which may trigger text-editing or re-Perspecting.
     */
    onClick = (event: MouseEvent) => {
        // If the Thing-text field isn't already open and there is no create-Relationship operation
        // in progress,
        if (
            !editingText
            && $relationshipBeingCreatedInfoStore.sourceThingId === null
        ) {
            // If this is a Ctrl-rightmouse event, begin editing the Thing's text.
            if (event.button === 0 && event.ctrlKey) {
                beginEditingText()

            // Otherwise, re-Perspect to this Thing.
            } else {
                rePerspectToThingId(thingId)
            }
        }
    }

    /**
     * On-mpuse-up method.
     * 
     * Handles mouse-up events on the Thing widget, which may complete or disable a create-
     * Relationship operation.
     */
    onMouseUp = () => {
        // If the Thing is relatable for an in-progress create-Relationship drag operation, set its
        // ID as the destination for that operation.
        if (relatableForCurrentDrag) {
            setRelationshipBeingCreatedDestThingId(thingId)

        // Otherwise, disable any in-progress create-Relationship drag operation.
        } else {
            disableRelationshipBeingCreated()
        }
    }

    /**
     * On-touch-end method.
     * 
     * Handles touch-end events on the Thing widget, which may complete or disable a create-
     * Relationship operation.
     */
    onTouchEnd = (event: TouchEvent) => {
        // Get the element under the touch event.
        const endingElement = elementUnderTouchEvent(event)

        // If that element is a Thing widget or Relationship Stem widget,
        if (
            endingElement?.className.includes("thing-widget")
            || endingElement?.className.includes("relationship-stem")
        ) {
            // Get the ID of the associated Thing.
            const targetThingId = Number(endingElement.id.split("-")[1].split("#")[1])

            // Determine if that Thing is a valid target for any drag-relate in progress.
            const targetThingRelatableForCurrentDrag =
                // The flag is true if...
                (
                    // ...there is a drag-relate in progress...
                    $relationshipBeingCreatedInfoStore.sourceThingId
                    // ...and the source of the drag-relate is not *this* Thing.
                    && $relationshipBeingCreatedInfoStore.sourceThingId !== targetThingId
                ) ? true :
                false

            // If the Thing is relatable for an in-progress create-Relationship drag operation, set its
            // ID as the destination for that operation.
            if (targetThingRelatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(targetThingId)

            // Otherwise, disable any in-progress create-Relationship drag operation.
            } else {
                disableRelationshipBeingCreated()
            }
        }
    }

    /**
     * Open a context command palette for this Thing.
     * 
     * @param event - The right-click mouse event that triggered the context command palette.
     */
    openCommandPalette = (event: MouseEvent) => {
        // Get the position of the right-click event.
        const position = [event.clientX, event.clientY] as [number, number]

        // Configure the buttons for the context menu.
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
            ),
                onMobile() ?
                    {
                        text: "Delete Thing",
                        iconName: "trash",
                        iconHtml: null,
                        isActive: false,
                        onClick: startDelete
                    } :
                    null
        ].filter(
            info => info !== null
        ) as CommandButtonInfo[]

        // Open a context command palette at that position, with those buttons.
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
        const reverseHistory = graph.history.reverseHistoryWithDateDividers.filter(
            entry => "thingId" in entry
        ) as HistoryEntry[]
        for (const historyEntry of reverseHistory) {
            if (historyEntry.thingId !== thingId && graphDbModelInStore("Thing", historyEntry.thingId)) {
                rePerspectToThingId(historyEntry.thingId)
                break
            }
        }

        // Delete the Thing and the Note in the search lists.
        await removeIdsFromThingSearchListStore(thingId)
        if (thing?.note?.id) await removeIdsFromNoteSearchListStore(thing?.note?.id)
    }

    // Text toggle.
    toggleSlider = async () => {
        showText = false
        sliderOpen = !sliderOpen
        showText = true
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


    /* --------------- Support attributes. --------------- */

    $: perspectiveText =
        String(thingId) in perspectiveTexts ? perspectiveTexts[String(thingId)] :
        null

    /**
     * Slider position controls.
     */

    // If the Thing ID changes, reset the slider to open if there is no Perspective text, and
    // closed if there is Perspective text.
    $: {
        thingId

        sliderOpen = !hasPerspectiveText
    }

    // The slider position is a percentage that is 0 if the slider is closed, and 100 if the slider
    // is open.
    let sliderPosition = 0
    $: if (!sliderOpen) sliderPosition = 0
    $: if (sliderOpen) sliderPosition = 100

    // The slider percentage is a percentage that is 0 if the slider is closed, and 87 if the
    // slider is open (allowing some space for the "handle").
    $: sliderPercentage = 0.87 * sliderPosition

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