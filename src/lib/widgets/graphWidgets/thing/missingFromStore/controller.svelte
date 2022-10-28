<script lang="ts">
    import type { Graph } from "$lib/models/constructModels";
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets";
    import { ThingBaseWidgetController } from "../base"

    export let thingId: number
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

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
    {graph}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize
/>