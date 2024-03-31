<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Graph, ThingCohort, GenerationMember, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import HalfAxisController from "./controller.svelte"

    // Import related widgets.
    import { RelationshipCohortWidget, ThingCohortWidget } from "$lib/widgets/graphWidgets"



    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rootThingWidth: number
    export let rootThingHeight: number
    export let parentThingCohortExpanded: boolean
    export let parentCladeOffsetFromCenterOfThingCohort: number
    export let perspectiveTexts: {[thingId: string]: string}
    export let cladeHovered: boolean
    export let rePerspectToThingId: (id: number) => Promise<void>


        
    // Attributes handled by the widget controller.
    let thingCohortMembersToDisplay: GenerationMember[]
    let tweenedOffsetToAlignToGrid: Tweened<number>
    let thingCohortExpanded = graph.pThing?.space?.buildmethod === "grid" ? false : true
    let tweenedThingOverlapMargin: Tweened<number>
    let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string
</script>


<!-- Half-axis widget controller. -->
<HalfAxisController
    {graph}
    {graphWidgetStyle}
    {parentThingCohortExpanded}
    {parentCladeOffsetFromCenterOfThingCohort}
    {thingCohort}

    bind:thingCohortMembersToDisplay
    bind:tweenedOffsetToAlignToGrid
    bind:thingCohortExpanded
    bind:tweenedThingOverlapMargin
    bind:getThingOverlapMarginStyleText
/>

<!-- Relationship Cohort Widgets (only for Cartesian axes). -->
{#if [1, 2, 3, 4].includes(thingCohort.halfAxisId)}
    <RelationshipCohortWidget
        bind:thingCohort
        {thingCohortMembersToDisplay}
        bind:graph
        {graphWidgetStyle}
        thingWidth={rootThingWidth}
        thingHeight={rootThingHeight}
        {cladeHovered}
        {thingCohortExpanded}
        offsetToAlignToGrid={$tweenedOffsetToAlignToGrid}
    />
{/if}

<!-- Thing Cohort Widgets. -->
{#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohort.halfAxisId)}
    <ThingCohortWidget
        {thingCohort}
        {thingCohortMembersToDisplay}
        bind:graph
        {graphWidgetStyle}
        offsetToAlignToGrid={$tweenedOffsetToAlignToGrid}
        bind:perspectiveTexts
        {rePerspectToThingId}
        bind:expanded={thingCohortExpanded}
        thingOverlapMargin={$tweenedThingOverlapMargin}
        {getThingOverlapMarginStyleText}
    />
{/if}