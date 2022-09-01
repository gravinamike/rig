<script lang="ts">
    // Widget model imports.
    import { CladeWidgetModel, GraphWidgetModel, ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { ThingWidget, ThingFormWidget, RelationshipCohortWidget, ThingCohortWidget, OffAxisRelationsWidget } from "$lib/widgets/graphWidgets"

    export let thingWidgetModel: ThingWidgetModel
    export let graphWidgetModel: GraphWidgetModel
    export let rePerspectToThingId: (id: number) => Promise<void>

    
    $: model = new CladeWidgetModel(thingWidgetModel, graphWidgetModel)


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
            bind:graphWidgetModel
            {rePerspectToThingId}
        />
    {:else}
        <ThingFormWidget
            thingWidgetModel={rootThing}
            bind:graphWidgetModel
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
                    bind:graphWidgetModel
                />
            {/if}
            {#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohortWidgetModel.cohort.halfAxisId)}
                <ThingCohortWidget
                    {thingCohortWidgetModel}
                    bind:graphWidgetModel
                    {rePerspectToThingId}
                />
            {/if}
        {/if}
    {/each}

    <OffAxisRelationsWidget
        parentThingWidgetModel={rootThing}
        parentGraphWidgetModel={graphWidgetModel}
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