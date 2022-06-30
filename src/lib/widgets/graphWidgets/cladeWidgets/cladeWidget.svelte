<script lang="ts">
    // Graph construct imports.
    import type { Graph } from "$lib/models/graphModels"

    import { CladeWidgetModel, ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { ThingWidget, ThingFormWidget, RelationshipCohortWidget, CohortWidget, OffAxisRelationsWidget } from "$lib/widgets/graphWidgets"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>

    
    $: model = new CladeWidgetModel(thingWidgetModel, graph)


    $: rootThing = model.submodels.rootThing
    $: childThingCohorts = model.submodels.childThingCohorts
    $: childRelationshipCohortsByHalfAxisId = model.submodels.childRelationshipCohortsByHalfAxisId
    $: note = model.note


    const showNotes = false
</script>


<!-- Clade widget.-->
<div
    class="clade-widget"
    style="{model.overlapMarginStyleText}"
>
    {#if rootThing.thing}
        <ThingWidget
            thingWidgetModel={rootThing}
            bind:graph={graph}
            {rePerspectToThingId}
        />
    {:else}
        <ThingFormWidget
            thingWidgetModel={rootThing}
            bind:graph={graph}
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
    {#each childThingCohorts as thingCohortWidgetModel (thingCohortWidgetModel.cohort.address)}
        {#if thingCohortWidgetModel.cohort.halfAxisId}
            {#if [1, 2, 3, 4].includes(thingCohortWidgetModel.cohort.halfAxisId)}
                <RelationshipCohortWidget
                    model={childRelationshipCohortsByHalfAxisId[thingCohortWidgetModel.cohort.halfAxisId]}
                    bind:graph={graph}
                />
            {/if}
            {#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohortWidgetModel.cohort.halfAxisId)}
                <CohortWidget
                    {thingCohortWidgetModel}
                    bind:graph={graph}
                    {rePerspectToThingId}
                />
            {/if}
        {/if}
    {/each}

    <OffAxisRelationsWidget
        parentThingWidgetModel={rootThing}
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