<script lang="ts">
    // Import types.
    import type { GenerationMember, Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import { HalfAxisWidget, ThingWidget, ThingFormWidget, OffAxisRelationsWidget } from "$lib/widgets/graphWidgets"
    import { relationshipBeingCreatedInfoStore } from "$lib/stores";
    
    

    /**
     * @param graph - The Graph that the Clade is in.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param parentThingCohortRowOrColumn - Whether the Clade's parent Thing Cohort is arranged as a row or column.
     * @param parentThingCohortMemberOnTopIndex - The index of the member of the parent Thing Cohort that is visually on top.
     * @param rootThing - The Thing that forms the root of the Clade.
     * @param rootThingThingCohortMembers - Array containing all members of the Thing Cohort containing the root Thing.
     * @param rootThingThingCohortExpanded - Whether the Thing Cohort this is part of is expanded or collapsed.
     * @param thingOverlapMargin - The amount to overlap sibling Things (in pixels) if the overlap percentage is negative.
     * @param perspectiveTexts - The Perspective-specific texts of the Clade's child Things.
     * @param getThingOverlapMarginStyleText - Function to get the style text to implement the desired overlap between sibling Things.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let parentThingCohortRowOrColumn: "row" | "column"
    export let parentThingCohortMemberOnTopIndex: number
    export let rootThing: Thing
    export let rootThingThingCohortMembers: GenerationMember[]
    export let rootThingThingCohortExpanded: boolean
    export let thingOverlapMargin: number
    export let perspectiveTexts: {[thingId: string]: string}
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string
    export let rePerspectToThingId: (id: number) => Promise<void>
    


    // Attributes managed by the widget controller.
    let cartesianThingCohorts: ThingCohort[] = []
    let overlapMarginStyleText = ""
    let rootThingOffsetFromCenterOfThingCohort: number
    let showAsCollapsed: boolean
    let hoveredForHalfSecond: boolean
    let forceShowHalfAxisWidgets: boolean
    let trackTimeHovered: (initialize?: boolean, increment?: number) => void = () => {}
    let stopTrackingTimeHovered: () => void = () => {}

    // Attributes managed by sub-widgets.
    let rootThingWidth: number = 0
    let rootThingHeight: number = 0






    let cladeControlsOpened = false
</script>


<!-- Widget controller. -->
<CladeWidgetController
    {graph}
    {thingOverlapMargin}
    {parentThingCohortRowOrColumn}
    {getThingOverlapMarginStyleText}
    {rootThing}
    {graphWidgetStyle}
    {rootThingWidth}
    {rootThingHeight}
    {rootThingThingCohortMembers}
    {rootThingThingCohortExpanded}
    {cladeControlsOpened}

    bind:overlapMarginStyleText
    bind:rootThingOffsetFromCenterOfThingCohort
    bind:cartesianThingCohorts
    bind:showAsCollapsed
    bind:hoveredForHalfSecond
    bind:forceShowHalfAxisWidgets
    bind:trackTimeHovered
    bind:stopTrackingTimeHovered
/>


<!-- Clade widget.-->
<div
    class="clade-widget"
    class:on-top-in-thing-cohort={parentThingCohortMemberOnTopIndex === rootThing.address?.indexInCohort || 0}

    style="{overlapMarginStyleText}"

    on:mouseenter={async () => {
        parentThingCohortMemberOnTopIndex = rootThing.address?.indexInCohort || 0
        trackTimeHovered(true)
    }}
    
    on:mouseleave={stopTrackingTimeHovered}
>
    <!-- If the root Thing is specified, show a Thing Widget. -->
    {#if rootThing?.id}
        <ThingWidget
            thingId={rootThing.id}
            thing={rootThing}
            bind:graph
            {graphWidgetStyle}
            bind:perspectiveTexts
            {showAsCollapsed}
            bind:cladeControlsOpened
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
        {#if
            forceShowHalfAxisWidgets
            || thingCohort.members.length !== 0
            || (
                $relationshipBeingCreatedInfoStore.sourceThingId === thingCohort.parentThingId
                && $relationshipBeingCreatedInfoStore.sourceHalfAxisId === thingCohort.halfAxisId
            )
        }
            <!-- Half-axis widget. -->
            <HalfAxisWidget
                {thingCohort}
                bind:graph
                {graphWidgetStyle}
                {rootThingWidth}
                {rootThingHeight}
                parentThingCohortExpanded={rootThingThingCohortExpanded}
                parentCladeOffsetFromCenterOfThingCohort={rootThingOffsetFromCenterOfThingCohort}
                bind:perspectiveTexts
                cladeHovered={cladeControlsOpened}
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

    .clade-widget.on-top-in-thing-cohort {
        z-index: 1;
    }
</style>