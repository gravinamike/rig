<script lang="ts">
    // Import utility functions.
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { 
        hoveredThingIdStore, addGraphIdsNeedingViewerRefresh,
        relationshipBeingCreatedInfoStore
    } from "$lib/stores"

    import { Graph, Thing, ThingCohort, type GenerationMember } from "$lib/models/constructModels"
    

    /**
     * Create a Relationship Stem Widget controller.
     * @param cohort - The Thing Cohort that is associated with the Relationship Cohort.
     * @param graph - The Graph that the Cohort is in.
     * @param thingIdOfHoveredRelationship - The ID of the destination Thing of the currently hovered Relationship.
     * @param ofPerspectiveThing - Whether this Stem widget belongs to the Graph's Perspective Thing.
     * @param relationshipsExist - Whether there are any relationships in this Stem widget's Direction.
     * @param relationshipHovered - Whether any Relationship in this Stem widget's Direction is currently hovered.
     * @param thingHovered - Whether the destination Thing of any Relationship in this Stem widget's Direction is currently hovered.
     * @param isDragRelateSource - Whether the Stem widget is the source of an in-progress drag-relate operation.
     * @param addThingForm - A method that adds a Thing Form widget to the Thing Cohort associated with the Stem widget.
     */
    export let cohort: ThingCohort
    export let graph: Graph
    export let thingIdOfHoveredRelationship: number | null
    export let cohortMembersToDisplay: GenerationMember[]

    export let ofPerspectiveThing: boolean
    export let relationshipsExist: boolean
    export let relationshipHovered: boolean
    export let thingHovered: boolean
    export let isDragRelateSource: boolean
    export let addThingForm: () => void


    /* --------------- Output attributes. --------------- */

    /**
     * Of-Perspective-Thing flag.
     * 
     * Is true if this Stem widget belongs to the Graph's Perspective Thing.
     */
    $: ofPerspectiveThing =
        cohort.parentThing && cohort.parentThing.address?.generationId === 0 ? true :
        false

    /**
     * Relationships-exist flag.
     * 
     * Is true if there are any relationships in this Stem widget's Direction.
     */
    $: relationshipsExist =
        cohort.members.length ? true :
        false
    
    /**
     * Relationship-hovered flag.
     * 
     * Is true if the mouse is currently hovering over any Relationship in this
     * Stem widget's Direction.
     */
    $: relationshipHovered =
        (
            thingIdOfHoveredRelationship !== null
            && cohort.members.map(member => member.thingId).includes(thingIdOfHoveredRelationship)
        ) ? true :
        false

    /**
     * Thing-hovered flag.
     * 
     * Is true if the mouse is currently hovering over the destination Thing of
     * any Relationship in this Stem widget's Direction.
     */
    $: thingHovered =
        (
            $hoveredThingIdStore !== null
            && cohort.members.map(member =>  member.thingId).includes($hoveredThingIdStore)
        ) ? true :
        false

    /**
     * Is-drag-relate-source flag.
     * 
     * Is true if the Stem widget is the source of an in-progress drag-relate
     * operation.
     */
    $: isDragRelateSource = (
        $relationshipBeingCreatedInfoStore.sourceThingId === cohort.parentThingId
        && $relationshipBeingCreatedInfoStore.sourceHalfAxisId === cohort.halfAxisId
    ) ? true :
        false
    
    /**
     * Add-Thing-Form method.
     * 
     * Adds a Thing Form widget to the Thing Cohort associated with the Stem
     * widget.
     */
    addThingForm = async () => {
        // If there is not yet a Thing Form in the Graph, add one.
        if (graph.formActive === false) {
            const newThing = new Thing(null)
            cohort.addMember({thingId: null, thing: newThing, alreadyRendered: false})
            cohort = cohort // Needed for reactivity.
            cohortMembersToDisplay.push({
                thingId: null,
                thing: newThing,
                alreadyRendered: false
            })
            graph.formActive = true
        }
        // Refresh the view.
        addGraphIdsNeedingViewerRefresh(graph.id)
        // Allow the Thing Form Widget to render.
        await sleep(500)
        // Scroll to the Thing Form and put it into focus.
        const thingForms = document.getElementsByClassName("thing-form-widget")
        const thingForm = thingForms.length ? thingForms[0] : null
        const thingFormTextField = document.getElementById("thing-form-text-field")
        thingForm?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        })
        thingFormTextField?.focus()
    }
</script>