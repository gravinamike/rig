<script lang="ts">
    // Import types.
    import type { GenerationMember, ThingCohort, Thing } from "$lib/models/constructModels"
    import { deleteButtonRotationByHalfAxisId } from "$lib/shared/constants";

    // Import stores.
    import {
        relationshipBeingCreatedInfoStore, hoveredRelationshipTarget,
        hoveredThingIdStore, reorderingInfoStore
    } from "$lib/stores"
    
    
    /**
     * @param cohortMemberWithIndex - Object containing the index and the Generation Member the widget is based on.
     * @param thingIdOfHoveredRelationship - ID of any Thing that the mouse is hovering over.
     * @param relatableForCurrentDrag - Whether the widget is a valid target for an in-progress drag-relate operation.
     * @param fanSegmentHovered - Whether mouse is hovering over the widget.
     * @param fanSegmentClicked - Whether the widget hs been clicked.
     * @param thing - The Thing associated with this Relationship.
     * @param highlightLevel - The intensity of the highlight on the widget.
     * @param relationshipHovered - Whether the mouse is hovering over the Relationship widget.
     * @param deleteButtonRotation - How much to counter-rotate the delete button so it is right-side up.
     * @param willBeDeleted - Whether this Relationship will be deleted if a to-be-created-Relationship is created.
     * @param deleteRelationship - Method to delete this Relationship.
     */
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let thingIdOfHoveredRelationship: number | null
    export let relatableForCurrentDrag: boolean
    export let fanSegmentHovered: boolean
    export let fanSegmentClicked: boolean
    export let thing: Thing
    export let highlightLevel: "no-highlight" | "soft-highlight" | "hard-highlight"
    export let relationshipHovered: boolean
    export let deleteButtonRotation = 0
    export let willBeDeleted: boolean
    

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
     * The intensity of the highlight on the widget.
     */
    $: highlightLevel =
        // If... 
        (
            // ...the widget is clicked...  
            fanSegmentClicked
            // ...or the Relationship is being reordered...
            || $reorderingInfoStore.destThingId === cohortMemberWithIndex.member.thingId
        // The highlight is hard.
        ) ? "hard-highlight" :

        // Else, if...
        (
            // ...the widget, its parent Relationship widget, or the associated Thing are hovered...
            (fanSegmentHovered || relationshipHovered || thingHovered)
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
     * Relationship-hovered flag.
     * 
     * Indicates whether the mouse is hovering over the Relationship widget
     * that this widget is part of.
     */
    $: relationshipHovered = thing.id !== null && thing.id === thingIdOfHoveredRelationship








    $: halfAxisId = cohortMemberWithIndex.member.thing?.parentCohort?.halfAxisId || null
    
    /**
     * Rotation.
     * 
     * The rotation of the delete icon, determined by the half-axis.
     */
    $: deleteButtonRotation = deleteButtonRotationByHalfAxisId[halfAxisId || 0]








    /**
     * Will-be-deleted flag.
     * 
     * Indicates whether this Relationship will be deleted if a to-be-created-
     * Relationship is created. The flag is true if the new Relationship would
     * have the same endpoints as the existing Relationship.
     */
    $: willBeDeleted = (
        // The endpoints for the existing and new Relationships are valid,
        sourceThingId && destThingId && dragSourceThingId && dragDestThingId
        // and the endpoints are the same.
        && (
            ( sourceThingId === dragSourceThingId && destThingId === dragDestThingId )
            || ( sourceThingId === dragDestThingId && destThingId === dragSourceThingId )
        )
    ) ?
        true :
        false


    /* --------------- Support attributes. --------------- */
    
    /**
     * Thing-hovered flag.
     * 
     * Indicates whether the mouse is hovering over the Thing that is
     * associated with this Relationship.
     */
    $: thingHovered = thing.id === $hoveredThingIdStore

    /**
     * Source Thing ID.
     * 
     * The ID of this Relationship's source Thing.
     */
    $: sourceThingId = thing.parentThing?.id || null

    /**
     * Dest Thing ID.
     * 
     * The ID of this Relationship's destination Thing.
     */
    $: destThingId = thing.id
    
    /**
     * Drag-source Thing ID.
     * 
     * The ID of the Thing that an in-progress drag-relate operation is starting
     * from.
     */
    $: dragSourceThingId = $relationshipBeingCreatedInfoStore.sourceThingId

    /**
     * Drag-destination Thing ID.
     * 
     * The ID of the Thing that an in-progress drag-relate operation is pointing
     * to (or which is associated with the Relationship that is being pointed
     * to).
     */
    $: dragDestThingId = $hoveredRelationshipTarget ?
        (
            $hoveredRelationshipTarget.kind === "thing" ?
                ($hoveredRelationshipTarget as Thing).id :
                ($hoveredRelationshipTarget as ThingCohort).parentThingId
        ) :
        null
</script>