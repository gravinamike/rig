<script lang="ts">
    // Graph construct imports.
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { ThingWidget, ThingFormWidget, RelationshipCohortWidget, CohortWidget, OffAxisRelationsWidget } from "$lib/widgets/graphWidgets"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>
    

    // Cohort-related variables.
    $: thingCohortWidgetModels = thingWidgetModel.childThingCohortWidgetModels
    $: relationshipWidgetModelsByHalfAxisId = thingWidgetModel.relationshipsWidgetModelsByHalfAxisId
    $: betweenThingOverlap = graph.graphWidgetStyle.betweenThingOverlap

    let overlapMarginStyleText: string
    $: if (thingWidgetModel.parentCohort.members.length === 1) {
        overlapMarginStyleText = ""
    } else if (thingWidgetModel.address.indexInCohort === 0) {
        overlapMarginStyleText = thingWidgetModel.parentCohort.rowOrColumn() === "row" ?
            `margin-right: ${betweenThingOverlap / 2}px;` :
            `margin-bottom: ${betweenThingOverlap / 2}px;`
    } else if (thingWidgetModel.address.indexInCohort === thingWidgetModel.parentCohort.members.length - 1) {
        overlapMarginStyleText = thingWidgetModel.parentCohort.rowOrColumn() === "row" ?
            `margin-left: ${betweenThingOverlap / 2}px;` :
            `margin-top: ${betweenThingOverlap / 2}px;`
    } else {
        overlapMarginStyleText = thingWidgetModel.parentCohort.rowOrColumn() === "row" ?
            `margin-left: ${betweenThingOverlap / 2}px; margin-right: ${betweenThingOverlap / 2}px;` :
            `margin-top: ${betweenThingOverlap / 2}px; margin-bottom: ${betweenThingOverlap / 2}px;`
    }


    // Note-related variables.
    $: note = thingWidgetModel.note
    const showNotes = false
</script>


<!-- Clade widget.-->
<div
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
    {#each thingCohortWidgetModels as thingCohortWidgetModel (thingCohortWidgetModel.cohort.address)}
        {#if thingCohortWidgetModel.cohort.halfAxisId && [1, 2, 3, 4].includes(thingCohortWidgetModel.cohort.halfAxisId)}
            <RelationshipCohortWidget
                model={relationshipWidgetModelsByHalfAxisId[thingCohortWidgetModel.cohort.halfAxisId]}
                bind:graph
            />
        {/if}
        
        <CohortWidget
            {thingCohortWidgetModel}
            bind:graph
            {rePerspectToThingId}
        />
    {/each}

    <OffAxisRelationsWidget
        parentThingWidgetModel={thingWidgetModel}
        parentGraph={graph}
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