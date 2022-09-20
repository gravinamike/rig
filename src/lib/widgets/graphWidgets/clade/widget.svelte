<script lang="ts">
    // Import types.
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import {
        ThingWidget, ThingFormWidget,
        RelationshipCohortWidget, ThingCohortWidget,
        OffAxisRelationsWidget
    } from "$lib/widgets/graphWidgets"
    

    /**
     * @param {Thing} rootThing - The Thing that forms the root of the Clade.
     * @param {Graph} graph - The Graph that the Clade is in.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     * @param {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let rootThing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (id: number) => Promise<void>


    // Attributes managed by the widget controller.
    let overlapMarginStyleText: string

    // Attributes managed by sub-widgets.
    let rootThingWidth: number = 0
    let rootThingHeight: number = 0
</script>


<!-- Widget controller. -->
<CladeWidgetController
    {rootThing}
    {graphWidgetStyle}

    bind:overlapMarginStyleText
/>


<!-- Clade widget.-->
<div
    class="clade-widget"
    style="{overlapMarginStyleText}"
>

    <!-- If the root Thing is specified, show a Thing Widget. -->
    {#if rootThing}
        <ThingWidget
            thingId={rootThing.id}
            bind:graph
            {graphWidgetStyle}
            {rePerspectToThingId}
            bind:thingWidth={rootThingWidth}
            bind:thingHeight={rootThingHeight}
        />
    <!-- Otherwise, show a Thing-Form Widget. -->
    {:else}
        <ThingFormWidget
            thing={rootThing}
            bind:graph
            {graphWidgetStyle}
        />
    {/if}

    <!-- The Thing's child Thing and Relationship Cohorts. -->
    {#each rootThing.childThingCohorts as thingCohort (thingCohort.address)}

        <!-- Relationship Cohort Widgets (only for Cartesian axes). -->
        {#if [1, 2, 3, 4].includes(thingCohort.halfAxisId)}
            <RelationshipCohortWidget
                cohort={thingCohort}
                bind:graph
                {graphWidgetStyle}
                thingWidth={rootThingWidth}
                thingHeight={rootThingHeight}
            />
        {/if}

        <!-- Thing Cohort Widgets. -->
        {#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohort.halfAxisId)}
            <ThingCohortWidget
                {thingCohort}
                bind:graph
                {graphWidgetStyle}
                {rePerspectToThingId}
            />
        {/if}

    {/each}

    <!--- Off-axis relations widget. -->
    <OffAxisRelationsWidget
        parentThing={rootThing}
        parentGraph={graph}
        parentGraphWidgetStyle={graphWidgetStyle}
        {rePerspectToThingId}
    />
</div>


<style>
    .clade-widget {
        position: relative;
    }

    .clade-widget:hover {
        z-index: 1;
    }
</style>