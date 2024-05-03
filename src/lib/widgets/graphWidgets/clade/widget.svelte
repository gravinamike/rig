<script lang="ts">
    // Import types.
    import type { GenerationMember, Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { relationshipBeingCreatedInfoStore } from "$lib/stores"
    
    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import {
        UnshownRelationsIndicator, HalfAxisWidget, ThingWidget, ThingFormWidget, OffAxisRelationsWidget
    } from "$lib/widgets/graphWidgets"

    
    

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
    let cladeControlsOpened = false
    let cartesianThingCohorts: ThingCohort[] = []
    let overlapMarginStyleText = ""
    let rootThingOffsetFromCenterOfThingCohort: number
    let onTopInThingCohort: boolean
    let showAsCollapsed: boolean
    let hoveredForHalfSecond: boolean
    let forceShowHalfAxisWidgets: boolean
    let trackTimeHovered: (initialize?: boolean, increment?: number) => void = () => {}
    let stopTrackingTimeHovered: () => void = () => {}

    // Attributes managed by sub-widgets.
    let rootThingWidth: number = 0
    let rootThingHeight: number = 0
</script>


<!-- Widget controller. -->
<CladeWidgetController
    {graph}
    {thingOverlapMargin}
    {parentThingCohortRowOrColumn}
    {parentThingCohortMemberOnTopIndex}
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
    bind:onTopInThingCohort
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
    class:on-top-in-thing-cohort={onTopInThingCohort}

    style="{overlapMarginStyleText}"

    on:mouseenter={async () => {
        parentThingCohortMemberOnTopIndex = rootThing.address?.indexInCohort ?? 0
        trackTimeHovered(true)
    } }
    
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

    <!-- One half-axis widget for each of the Clade's Cartesian-Direction Thing Cohorts. -->
    {#each cartesianThingCohorts as thingCohort (thingCohort.address)}
        {#if
            // Render the half-axis widget if...

            // ...the Clade's forceShowHalfAxisWidgets flag is set, or...
            forceShowHalfAxisWidgets

            // ...the Thing Cohort's `shouldBeRendered` flag is set, or...
            || thingCohort.shouldBeRendered

            // ... there is a drag-relate operation in progress from that half-axis.
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

        <!-- Unshown-relations indicator. -->
        <UnshownRelationsIndicator
            parentThing={rootThing}
            directionId={thingCohort.direction?.id ?? 0}
            halfAxisId={thingCohort.halfAxisId}
            {thingCohort}
            thingSize={rootThingWidth}
            {graphWidgetStyle}
        />
    {/each}

    <!--- Off-axis relations indicator. -->
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