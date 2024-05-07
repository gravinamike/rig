<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Graph, ThingCohort, GenerationMember, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import HalfAxisController from "./controller.svelte"

    // Import related widgets.
    import { RelationshipCohortOutlineWidget, ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants";
    import type { Editor } from "@tiptap/core";




    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let expanded: boolean
    export let outlineScrollAreaTop: number
    export let outlineScrollTime: Date | null
    export let editingNotes: boolean
    export let notesEditor: Editor | null
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



    let parentThingCohortExpanded: boolean
    let parentCladeOffsetFromCenterOfThingCohort: number
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










{#if !thingCohort.isRetrograde}
    <div
        class="relationships-and-child-cohorts-outer-container"
        class:expanded
    >
        <!-- Relationship color field. -->
        <div
            class="relationship-color-field"

            style="background-color: {relationshipColorByHalfAxisId[thingCohort.halfAxisId] || "dimgrey"};"
        />

        <!-- The Thing's Relationships and child Thing Cohorts (inner container). -->
        <div
            class="relationships-and-child-cohorts-inner-container"
            
            style="flex-direction: { expanded ? "row" : "column" };"
        >

            <!-- Relationship Cohort Widget. -->
            <div
                class="relationships-outline-widget-container"
                class:expanded
                class:has-children={thingCohort.members.length}
            >
                <!-- Relationship Cohort outline widget. -->
                <RelationshipCohortOutlineWidget
                    {thingCohort}
                    bind:graph
                    {graphWidgetStyle}
                    {outlineScrollAreaTop}
                    {outlineScrollTime}
                />


                
            </div>

            <!-- Thing Cohort Widget. -->
            {#if (
                thingCohort.members.length
                && thingCohort.generation
                && !thingCohort.generation.isRelationshipsOnly
            )}
                <ThingCohortOutlineWidget
                    {thingCohort}
                    bind:graph
                    bind:graphWidgetStyle
                    {outlineScrollAreaTop}
                    {outlineScrollTime}
                    bind:editingNotes
                    bind:notesEditor
                    {rePerspectToThingId}
                />
            {/if}
        </div>
    </div>
{/if}


<style>
    .relationships-and-child-cohorts-outer-container {
        border-radius: 5px;

        position: relative;
        min-height: 0.5rem;

        display: none;
    }

    .expanded.relationships-and-child-cohorts-outer-container {
        display: flex;
        flex-direction: column;
    }

    .relationships-and-child-cohorts-outer-container:hover {
        position: relative;
    }

    .relationships-and-child-cohorts-outer-container:hover {
        min-height: 1.05rem;
    }

    .relationship-color-field {
        position: absolute;
        height: 100%;
        width: 100%;
        opacity: 0.25;
    }

    .relationships-and-child-cohorts-inner-container {
        display: flex;
        flex: 1 1 auto;
    }

    .relationships-outline-widget-container {
        position: relative;
        transform: scale(0.5);
        transform-origin: left;

        display: none;
    }

    .relationships-outline-widget-container:not(.expanded.has-children) {
        width: 100%;
    }

    .relationships-outline-widget-container.expanded.has-children {
        width: fit-content;
        min-height: 100%;
        transform: scale(1);

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .relationships-and-child-cohorts-outer-container:hover
    > .relationships-and-child-cohorts-inner-container
    > .relationships-outline-widget-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
</style>