<script lang="ts">
    // Import type.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Direction, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import RelationshipCohortWidgetController from "./controller.svelte"

    // Import related widgets.
    import { DirectionWidget } from "$lib/widgets/graphWidgets"


    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    // Attributes managed by widget controller.
    let direction: Direction
    let halfAxisId: HalfAxisId
</script>


<!-- Widget controller. -->
<RelationshipCohortWidgetController
    cohort={thingCohort}
    {graph}
    {graphWidgetStyle}
    
    bind:direction
    bind:halfAxisId
/>


<!-- Relationships Outline Widget. -->
<div
    class="relationships-outline-widget"
/>

<!-- Direction text. -->
<div class="direction-widget-container">
    <DirectionWidget
        {direction}
        {halfAxisId}
        {graphWidgetStyle}
        optionClickedFunction={(direction, _, option) => {console.log(direction, option)}}
    />
</div>


<style>
    .relationships-outline-widget {
        position: absolute;
        width: 100%;
        height: 100%;

        opacity: 0.25;
    }

    .relationships-outline-widget:hover {
        opacity: 0.5;
    }

    .relationships-outline-widget:active {
        opacity: 1.0;
    }

    .direction-widget-container {
        position: absolute;
        left: 0.25rem;
        top: 0.25rem;
        z-index: 1;
    }
</style>