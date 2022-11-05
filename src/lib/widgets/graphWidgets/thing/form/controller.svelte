<script lang="ts">
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide"
    import type { GenerationMember, Graph, Space, Thing } from "$lib/models/constructModels"

    // Import constants and stores.
    import type { HalfAxisId } from "$lib/shared/constants"
    import { storeGraphDbModels, addGraphIdsNeedingViewerRefresh, updateThingSearchListStore } from "$lib/stores"

    import { ThingBaseWidgetController } from "../base"

    // Import API methods.
    import { thingSearchListItems, createNewRelatedThing } from "$lib/db/clientSide"
    import type { GraphWidgetStyle } from "../../graph";


    /**
     * @param thing - The Thing that the widget is based on.
     * @param graph - The Graph that the Thing is part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param textField - The HTML element of the Thing's text field.
     * @param encapsulatingDepth - How many levels of encapsulation separate the Thing from the Perspective Thing.
     * @param thingWidth - The width of a Thing in this Graph.
     * @param thingHeight - The height of a Thing in this Graph.
     * @param distanceFromFocalPlane - The difference between the Plane that the Thing is in and the currently-focused Plane.
     * @param submit - Method to submit the Thing form in order to create a new Thing.
     * @param cancel - Method to remove the Thing form before creating a new Thing.
     */
    export let thing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let text: string
    export let cohortMembersToDisplay: GenerationMember[]

    export let encapsulatingDepth = 0
    export let thingWidth = 0
    export let thingHeight = 0
    export let distanceFromFocalPlane = 0
    export let submit: () => void
    export let cancel: () => void


    // Attributes handled by base widget controller.
    let planeId: number
    let halfAxisId: HalfAxisId


    /* --------------- Output attributes. --------------- */

    /**
     * Submit method.
     * 
     * Submits the Thing form, calling for the creation of a new Thing with the
     * text in the input field.
    */
    submit = async () => {
        // Get information needed to create the new Thing.
        const parentThingId = (thing.parentThing?.id as number)
        const space = (thing.parentCohort.parentThing as Thing).space as Space
        const directionId = space.directionIdByHalfAxisId[halfAxisId] as number

        // Create the new Thing.
        const newRelatedThing = await createNewRelatedThing(parentThingId, directionId, text)

        // Refresh stores, graph, and search lists.
        if (newRelatedThing && newRelatedThing.id) {
            await storeGraphDbModels<ThingDbModel>("Thing", parentThingId, true)
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)

            const queriedThingSearchListItems = await thingSearchListItems([newRelatedThing.id])
            if (queriedThingSearchListItems) updateThingSearchListStore(queriedThingSearchListItems)
        }
    }

    /**
     * Cancel method.
     * 
     * Cancels the create-Thing operation, clearing out the Thing form and
     * associated flags and refreshing the Graph.
    */
    cancel = async () => {
        thing.parentCohort.removeMemberById(thing.id as number)
        cohortMembersToDisplay.pop()
        graph.formActive = false
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
</script>


<ThingBaseWidgetController
    {thing}
    {graph}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:distanceFromFocalPlane
    bind:halfAxisId
/>