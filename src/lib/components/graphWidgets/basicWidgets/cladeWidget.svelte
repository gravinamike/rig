<script lang="ts">
    // Graph construct imports.
    import type { Graph } from "$lib/shared/graph/graph"
    import type { ThingWidgetModel } from "$lib/shared/graph/widgetModels/thingWidgetModel"

    // Graph widget imports.
    import ThingWidget from "$lib/components/graphWidgets/basicWidgets/thingWidget.svelte"
    import RelationshipsWidget from "$lib/components/graphWidgets/basicWidgets/relationshipsWidget.svelte"
    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>
    

    // Cohort-related variables.
    $: space = thingWidgetModel.space
    $: cohorts = thingWidgetModel.childCohorts
    $: overlap = -Math.min(0, graph.graphWidgetStyle.betweenThingGap / 2)

    // Note-related variables.
    $: note = thingWidgetModel.note
    const showNotes = false
</script>


<!-- Clade widget.-->
<main
    class="clade-widget"
    style="margin: {-overlap}px;"
>
    <ThingWidget
        {thingWidgetModel}
        bind:graph
        {rePerspectToThingId}
    />

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