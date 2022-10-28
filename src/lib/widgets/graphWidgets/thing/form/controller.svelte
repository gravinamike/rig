<script lang="ts">
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide"
    import type { Graph, Space, Thing } from "$lib/models/constructModels"

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
    export let textField: HTMLTextAreaElement

    export let encapsulatingDepth: number
    export let thingWidth: number
    export let thingHeight: number
    export let distanceFromFocalPlane: number
    
    export let submit: () => {}
    export let cancel: () => {}


    let planeId: number
    let halfAxisId: HalfAxisId


    /* --------------- Output attributes. --------------- */

    submit = async () => {
        const parentThingId = (thing.parentThing?.id as number)
        const space = (thing.parentCohort.parentThing as Thing).space as Space
        const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
        const text = textField.value

        const newRelatedThing = await createNewRelatedThing(parentThingId, directionId, text)
        if (newRelatedThing && newRelatedThing.id) {
            await storeGraphDbModels<ThingDbModel>("Thing", parentThingId, true)
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)

            const queriedThingSearchListItems = await thingSearchListItems([newRelatedThing.id])
            if (queriedThingSearchListItems) updateThingSearchListStore(queriedThingSearchListItems)
        }
    }

    cancel = async () => {
        thing.parentCohort.removeMemberById(thing.id as number)
        graph.formActive = false
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
        
</script>


<ThingBaseWidgetController
    thingId={null}
    {graph}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:distanceFromFocalPlane

    bind:halfAxisId
/>