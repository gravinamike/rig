<script lang="ts">
    // Import types.
    import type { GenerationMember, Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import {
        ThingWidget, ThingFormWidget,
        HalfAxisWidget,
        OffAxisRelationsWidget
    } from "$lib/widgets/graphWidgets"
    

    /**
     * @param rootThing - The Thing that forms the root of the Clade.
     * @param graph - The Graph that the Clade is in.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param perspectiveTexts - Object containing texts for Things rendered from the root Thing's Perspective.
     * @param rootThingThingCohortMembers - Array containing all members of the Thing Cohort containing the root Thing.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let rootThing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let perspectiveTexts: {[thingId: string]: string}
    export let rootThingThingCohortMembers: GenerationMember[]
    export let rePerspectToThingId: (id: number) => Promise<void>


    // Attributes managed by the widget controller.
    let cartesianThingCohorts: ThingCohort[] = []
    let overlapMarginStyleText: string

    // Attributes managed by sub-widgets.
    let rootThingWidth: number = 0
    let rootThingHeight: number = 0
</script>


<!-- Widget controller. -->
<CladeWidgetController
    {rootThing}
    {graphWidgetStyle}

    bind:cartesianThingCohorts
    bind:overlapMarginStyleText
/>


<!-- Clade widget.-->
<div
    class="clade-widget"
    style="{overlapMarginStyleText}"
>

    <!-- If the root Thing is specified, show a Thing Widget. -->
    {#if rootThing?.id}
        <ThingWidget
            thingId={rootThing.id}
            thing={rootThing}
            bind:graph
            {graphWidgetStyle}
            bind:perspectiveTexts
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
            {perspectiveTexts}
            cohortMembersToDisplay={rootThingThingCohortMembers}
        />
    {/if}

    <!-- The Thing's child Thing and Relationship Cohorts. -->
    {#each cartesianThingCohorts as thingCohort (thingCohort.address)}
        <!-- Half-axis widget. -->
        <HalfAxisWidget
            {thingCohort}
            bind:graph
            {graphWidgetStyle}
            bind:perspectiveTexts
            {rootThingWidth}
            {rootThingHeight}
            {rePerspectToThingId}
        />
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