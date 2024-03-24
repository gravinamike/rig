<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import related widgets.
    import { CladeOutlineWidget, ThingOutlineAlreadyRenderedWidget } from "$lib/widgets/graphWidgets"

    
    /**
     * @param thingCohort - The Thing Cohort used to set up this widget.
     * @param graph - The Graph that the Thing Cohort is in.
     * @param graphWidgetStyle - Controls the visual styling of the Graph.
     * @param notesEditor - The active Tiptap editor (if any) for the Graph outline widget this belongs to.
     * @param rePerspectToThingId - A function that re-Perspects the Graph to a given Thing ID.
     */
    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let editingNotes: boolean
    export let notesEditor: Editor | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>
</script>


<div
    class="cohort-outline-widget"
    class:off-axis={graph.offAxis}
>
    {#if !thingCohort.isRetrograde}
        {#each thingCohort.members as cohortMember, i}
            <!-- If the Thing already exists in the Graph, render a Thing-already-rendered widget. -->
            {#if cohortMember.alreadyRendered && cohortMember.thingId}
                <ThingOutlineAlreadyRenderedWidget
                    thingId={cohortMember.thingId}
                    thing={cohortMember.thing}
                    {graph}
                    {graphWidgetStyle}
                />

            <!-- Otherwise render a Clade widget with the Thing as its root. -->
            {:else if cohortMember.thing}
                <CladeOutlineWidget
                    rootThing={cohortMember.thing}
                    {graph}
                    {graphWidgetStyle}
                    bind:editingNotes
                    bind:notesEditor
                    {rePerspectToThingId}
                />
            {/if}
        {/each}
    {/if}
</div>


<style>
    .cohort-outline-widget {
        flex: 1 1 auto;

        display: flex;
        flex-direction: column;
        padding: 0.25rem;
        gap: 0.25rem;

        overflow: visible;
    }

    .cohort-outline-widget:not(.off-axis) {
        padding: 0;
        gap: 0;
    }
</style>