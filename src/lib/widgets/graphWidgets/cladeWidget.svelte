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
    $: cohorts = thingWidgetModel.childCohorts
    $: relationshipWidgetModelsByHalfAxisId = thingWidgetModel.relationshipsWidgetModelsByHalfAxisId
    $: betweenThingSpacing = graph.graphWidgetStyle.betweenThingSpacing
    $: overlap = -Math.min(0, betweenThingSpacing / 2)

    let overlapMarginStyleText: string
    $: if (thingWidgetModel.parentCohort.members.length === 1) {
        overlapMarginStyleText = ""
    } else if (thingWidgetModel.address.indexInCohort === 0) {
        overlapMarginStyleText = thingWidgetModel.parentCohort.rowOrColumn() === "row" ?
            `margin-right: ${-overlap}px;` :
            `margin-bottom: ${-overlap}px;`
    } else if (thingWidgetModel.address.indexInCohort === thingWidgetModel.parentCohort.members.length - 1) {
        overlapMarginStyleText = thingWidgetModel.parentCohort.rowOrColumn() === "row" ?
            `margin-left: ${-overlap}px;` :
            `margin-top: ${-overlap}px;`
    } else {
        overlapMarginStyleText = thingWidgetModel.parentCohort.rowOrColumn() === "row" ?
            `margin-left: ${-overlap}px; margin-right: ${-overlap}px;` :
            `margin-top: ${-overlap}px; margin-bottom: ${-overlap}px;`
    }


    // Note-related variables.
    $: note = thingWidgetModel.note
    const showNotes = false
</script>


<!-- Clade widget.-->
<main
    class="clade-widget"
    style="{overlapMarginStyleText}"
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
                relationshipsWidgetModel={relationshipWidgetModelsByHalfAxisId[cohort.address.halfAxisId]}
            />
        {/if}
        
        <CohortWidget
            {cohort}
            bind:graph
            {rePerspectToThingId}
        />
    {/each}

</main>


<style>
    .clade-widget {
        position: relative;
    }

    .clade-widget:hover {
        z-index: 1;
    }
</style>