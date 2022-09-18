<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Thing } from "$lib/models/constructModels"

    //import { relationshipBeingCreatedInfoStore } from "$lib/stores"
    import { ThingBaseWidgetController } from "../base"
    import type { GraphWidgetStyle } from "../../graph";

    /**
     * Create a Thing Widget Model.
     * @param {number} thingId - The ID of the Thing that the widget is based on.
     */
    export let thingId: number
    export let graphWidgetStyle: GraphWidgetStyle

    export let planeId: number
    export let encapsulatingDepth: number
    export let thingSize: number
    export let thingWidth: number
    export let thingHeight: number
    export let xYElongation: {x: number, y: number}
    export let cohortSize: number
    export let thing: Thing
    export let halfAxisId: HalfAxisId
    export let elongationCategory: "vertical" | "horizontal" | "neutral"

    export let thingWidgetId: string
    export let isEncapsulating: boolean
    export let relatableForCurrentDrag: boolean


    /* --------------- Output attributes. --------------- */

    /**
     * Thing Widget ID.
     * 
     * A unique ID for each Thing Widget, constructed from the Graph ID and the
     * Thing ID.
     */
    $: thingWidgetId = `graph#${ thing.address.graph.id }-thing#${ thingId }`

    /**
     * Is-encapsulating flag.
     * 
     * This attribute indicates whether the Thing is related to other Things on
     * the encapsulation axis. It is true if the Thing's half-axis is Inward, or
     * if it has child Thing Cohorts on the Outward half-axis.
     */
    $: isEncapsulating =
        halfAxisId === 8 || 7 in thing.childCohortsByHalfAxisId ? true :
        false

    /**
     * Relatable-for-current-drag flag.
     * 
     * This attribute indicates whether the Thing is a valid target for relating
     * for the current drag-relate operation.
     */
    $: relatableForCurrentDrag = false/*
        // The flag is true if...
        (
            // ...there is a drag-relate in progress...
            $relationshipBeingCreatedInfoStore.sourceWidgetModel
            // ...and the source of the drag-relate is not *this* Thing.
            && !(
                $relationshipBeingCreatedInfoStore.sourceWidgetModel.kind === "thingWidgetModel"
                && $relationshipBeingCreatedInfoStore.sourceWidgetModel.thingId === thingId
            )
        ) ?
            true :
            false*/
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