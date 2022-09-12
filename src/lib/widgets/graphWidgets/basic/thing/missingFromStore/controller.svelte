<script lang="ts">
    import type { GraphWidgetModel } from "../../graph/graph"
    import { ThingBaseWidgetController } from "../base"

    export let thingId: number
    export let graphWidgetModel: GraphWidgetModel

    export let planeId: number
    export let encapsulatingDepth: number
    export let thingSize: number
    export let thingWidth: number
    export let thingHeight: number
    export let xYElongation: {x: number, y: number}
    export let cohortSize: number
</script>

<ThingBaseWidgetController
    {thingId}
    {graphWidgetModel}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize
/>