<script lang="ts">
    // Graph construct imports.
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    // Graph widget imports.
    import { ThingOutlineWidget, ThingOutlineFormWidget, RelationshipsOutlineWidget, CohortOutlineWidget } from "$lib/widgets/graphWidgets"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>
    

    // Cohort-related variables.
    $: cohortWidgetModels = thingWidgetModel.childCohortWidgetModels
    $: relationshipWidgetModelsByHalfAxisId = thingWidgetModel.relationshipsWidgetModelsByHalfAxisId

    $: expanded = (
        cohortWidgetModels.length
        && cohortWidgetModels[0].cohort.generation
        && !cohortWidgetModels[0].cohort.generation.isRelationshipsOnly
    ) ?
        true :
        false
</script>


<!-- Clade widget.-->
<div
    class="clade-outline-widget"
>
    {#if thingWidgetModel.thing}
        <ThingOutlineWidget
            {thingWidgetModel}
            bind:graph
            {rePerspectToThingId}
        />
    {:else}
        <ThingOutlineFormWidget
            {thingWidgetModel}
            bind:graph
        />
    {/if}

    <!-- The Thing's Relationships and child Cohorts. -->
    {#each cohortWidgetModels as cohortWidgetModel (cohortWidgetModel.cohort.address)}  
        <div
            class="relationships-and-child-cohorts"
            style="
                display: flex;
                flex-direction: { expanded ? "row" : "column" };
            "
        >
            {#if cohortWidgetModel.cohort.members.length}
                <div
                    class="relationships-outline-widget-container"
                    style="position: relative; width: { expanded ? "100px" : "100%" }; min-height: { expanded ? "100%" : "1rem" };"
                >
                    <RelationshipsOutlineWidget
                        relationshipsWidgetModel={relationshipWidgetModelsByHalfAxisId[cohortWidgetModel.cohort.address.halfAxisId]}
                        bind:graph
                    />
                </div>

                {#if (
                    cohortWidgetModel.cohort.generation
                    && !cohortWidgetModel.cohort.generation.isRelationshipsOnly
                )}
                    <CohortOutlineWidget
                        {cohortWidgetModel}
                        bind:graph
                        {rePerspectToThingId}
                    />
                {/if}
            {/if}
        
        </div>
    {/each}
</div>


<style>
    .clade-outline-widget {
        box-sizing: border-box;
        border: solid 1px black;
        outline-offset: 1px;
        border-radius: 10px;

        width: 100%;

        overflow: hidden;
    }
</style>