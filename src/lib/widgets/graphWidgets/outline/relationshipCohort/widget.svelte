<script context="module" lang="ts">
    // Type imports.
    import type { Graph } from "$lib/models/graphModels"
    import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
</script>

<script lang="ts">
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    export let relationshipsWidgetModel: RelationshipCohortWidgetModel
    export let graph: Graph


    /* Basic Widget information. */
    
    // Information related to the Relationships Widget's place in the Graph.
    const halfAxisId = relationshipsWidgetModel.halfAxisId

    // Information related to Direction.
    const direction = relationshipsWidgetModel.direction
</script>


<!-- Relationships Outline Widget. -->
<div
    class="relationships-outline-widget"
    
/>

<!-- Direction text. -->
<div class="direction-widget-container">
    <DirectionWidget
        {direction}
        {halfAxisId}
        {graph}
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