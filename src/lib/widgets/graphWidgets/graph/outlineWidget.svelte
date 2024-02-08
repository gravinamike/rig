<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { landscapeOrientation, titleFontStore, titleFontWeightStore, uITrimColorStore } from "$lib/stores"

    // Import related widgets.
    import { ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    import { onMobile } from "$lib/shared/utility";
    


    /**
     * @param graph - The Graph that the widget is based on.
     * @param graphWidgetStyle - Controls the style of the widget.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>



    // Outline title (root Thing text).
    $: title = graph.rootCohort?.members[0].thing?.text ?? "THING NOT FOUND IN STORE"
</script>


<!-- Graph outline widget. -->
<div
    class="graph-outline-widget"
    class:off-axis={graph.offAxis}

    style={graph.offAxis ? "" : `background-color: ${$uITrimColorStore};`}
>
    {#if !graph.offAxis}
        <!-- Title. -->
        <div
            class="title"

            style="
                margin-left: {onMobile() && !$landscapeOrientation ? 60 : 8}px;
                margin-right: {onMobile() ? 45 : 0}px;
                {
                    onMobile() ? (
                        !$landscapeOrientation ? "position: relative; top: 5px; font-size: 0.9rem;" :
                        "position: relative; top: 5px; left: 4px; font-size: 0.9rem;"
                    ) :

                    ""
                }
                font-family: {$titleFontStore ?? "Arial"};
                font-weight: {$titleFontWeightStore ?? 600};
            "
        >
            <div>{title}</div>
        </div>
    {/if}

    <!-- Root Thing Cohort widget (from which the rest of the Graph Outline automatically "grows"). -->
    <div class="root-thing-cohort-container">
        {#if graph.rootCohort}
            <ThingCohortOutlineWidget
                thingCohort={graph.rootCohort}
                {graph}
                {graphWidgetStyle}
                {rePerspectToThingId}
            />
        {/if}
    </div>
</div>


<style>
    .graph-outline-widget {
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.5rem;
        
        user-select: none;
    }

    .graph-outline-widget.off-axis {
        padding: 0rem;
    }

    .title {
        flex: 0 0 34px;

        height: 34px;

        display: flex;
        align-items: center;
    }

    .title div {
        margin: 0;

        text-align: left;
        font-size: 1.5rem;
        line-height: 1.5rem;
    }

    .root-thing-cohort-container {
        overflow-x: visible;
        overflow-y: auto; 
        scrollbar-width: thin;
    }
</style>