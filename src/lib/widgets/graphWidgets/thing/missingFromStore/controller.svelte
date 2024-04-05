<script lang="ts">
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { ThingBaseWidgetController } from "../base"

    export let graphWidgetStyle: GraphWidgetStyle
    export let encapsulatingDepth: number
    export let thingSize: number
    export let thingWidth: number
    export let thingHeight: number
    export let xYElongation: {x: number, y: number}
    export let cohortSize: number
</script>


<ThingBaseWidgetController
    thing={null}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize
/>