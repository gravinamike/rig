<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Thing } from "$lib/models/constructModels"

    import { relationshipBeingCreatedInfoStore } from "$lib/stores"
    import { ThingBaseWidgetController } from "../base"
    import type { GraphWidgetStyle } from "../../graph";

    /**
     * Create a Thing Widget Model.
     * @param {number} thingId - The ID of the Thing that the widget is based on.
     */
    export let thingId: number
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    export let planeId: number | null = null
    export let encapsulatingDepth: number = 0
    export let thingSize: number = 0
    export let thingWidth: number = 0
    export let thingHeight: number = 0
    export let xYElongation: {x: number, y: number} = {x: 1, y:1}
    export let cohortSize: number = 0
    export let thing: Thing | null = null
    export let halfAxisId: HalfAxisId | null = null
    export let elongationCategory: "vertical" | "horizontal" | "neutral" = "neutral"

    export let thingWidgetId: string = ""
    export let isEncapsulating = false
    export let relatableForCurrentDrag = false


    /* --------------- Output attributes. --------------- */

    /**
     * Thing Widget ID.
     * 
     * A unique ID for each Thing Widget, constructed from the Graph ID and the
     * Thing ID.
     */
    $: thingWidgetId = `graph#${ graph.id }-thing#${ thingId }`

    /**
     * Is-encapsulating flag.
     * 
     * This attribute indicates whether the Thing is related to other Things on
     * the encapsulation axis. It is true if the Thing's half-axis is Inward, or
     * if it has child Thing Cohorts on the Outward half-axis.
     */
    $: isEncapsulating =
        thing && (halfAxisId === 8 || 7 in thing.childCohortsByHalfAxisId) ? true :
        false

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
</script>



<ThingBaseWidgetController
    {thingId}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize

    bind:thing
    bind:halfAxisId
    bind:elongationCategory
/>