<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Thing } from "$lib/models/constructModels"
    import type { GraphWidgetModel } from "$lib/models/widgetModels"
    import { ThingBaseWidgetController } from "../base"

    export let thingId: number
    export let graphWidgetModel: GraphWidgetModel

    export let planeId: number
    export let encapsulatingDepth: number
    export let xYElongation: {x: number, y: number}
    export let cohortSize: number
    export let halfAxisId: HalfAxisId
    export let thing: Thing
</script>


<ThingBaseWidgetController
    {thingId}
    {graphWidgetModel}

    bind:planeId
    bind:encapsulatingDepth
    bind:xYElongation
    bind:cohortSize
    bind:halfAxisId
    bind:thing
/>