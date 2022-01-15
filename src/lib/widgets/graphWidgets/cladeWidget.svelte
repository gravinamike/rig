<script lang="ts">
    // Graph construct imports.
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { ThingWidget, ThingFormWidget, RelationshipsWidget, CohortWidget } from "$lib/widgets/graphWidgets"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>
    

    // Cohort-related variables.
    $: space = thingWidgetModel.space
    $: cohorts = thingWidgetModel.childCohorts
    $: betweenThingGap = 0.01 * graph.graphWidgetStyle.thingSpacingPercent * graph.graphWidgetStyle.thingSize
    $: overlap = -Math.min(0, betweenThingGap / 2)

    // Note-related variables.
    $: note = thingWidgetModel.note
    const showNotes = false
</script>


<!-- Clade widget.-->
<main
    class="clade-widget"
    style="margin: {-overlap}px;"
>
    {#if thingWidgetModel.thing}
        <ThingWidget
            {thingWidgetModel}
            bind:graph
            {rePerspectToThingId}
        />
    {:else}
        <ThingFormWidget
            {thingWidgetModel}
            bind:graph
        />
    {/if}

    {#if showNotes}
        {#if note}
            {@html note.text}
        {:else}
            <h2>NO NOTES YET</h2>
        {/if}
    {/if}

    <!-- The Thing's Relationships and child Cohorts. -->
    {#each cohorts as cohort (cohort.address)}
        {#if cohort.address.halfAxisId && [1, 2, 3, 4].includes(cohort.address.halfAxisId)}
            <RelationshipsWidget
                {cohort}
                {space}
                bind:graph
            />
        {/if}
        
        <CohortWidget
            {cohort}
            bind:graph
            {rePerspectToThingId}
        />
    {/each}

</main>