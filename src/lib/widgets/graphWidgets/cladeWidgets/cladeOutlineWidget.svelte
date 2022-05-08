<script lang="ts">
    // Graph construct imports.
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"
    
    // Constant imports.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Utility imports.
    import { hexToRgba } from "$lib/shared/utility"

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

    $: shadowColor = relationshipColorByHalfAxisId[thingWidgetModel.halfAxisId]
</script>


<!-- Clade widget.-->
<div
    class="clade-outline-widget"
    class:expanded
    class:has-children={cohortWidgetModels.length}
    style="box-shadow: 5px 5px 10px 2px {hexToRgba(shadowColor, 0.333)};"
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
            class="relationships-and-child-cohorts-outer-container"
            style="
                position: relative;
                background-color: white;
            "
        >
            <div
                style="
                    position: absolute; width: 100%; height: 100%;
                    background-color: {relationshipColorByHalfAxisId[cohortWidgetModel.cohort.address.halfAxisId]};
                    opacity: 0.25;
                "
            />

            <div
                class="relationships-and-child-cohorts-inner-container"
                style="

                    display: flex;
                    flex-direction: { expanded ? "row" : "column" };
                "    
            >
                <div
                    class="relationships-outline-widget-container"
                    class:expanded
                    class:has-children={cohortWidgetModel.cohort.members.length}
                >
                    <RelationshipsOutlineWidget
                        relationshipsWidgetModel={relationshipWidgetModelsByHalfAxisId[cohortWidgetModel.cohort.address.halfAxisId]}
                        bind:graph
                    />
                </div>

                {#if (
                    cohortWidgetModel.cohort.members.length
                    && cohortWidgetModel.cohort.generation
                    && !cohortWidgetModel.cohort.generation.isRelationshipsOnly
                )}
                    <CohortOutlineWidget
                        {cohortWidgetModel}
                        bind:graph
                        {rePerspectToThingId}
                    />
                {/if}
            </div>
        
        </div>
    {/each}
</div>


<style>
    .clade-outline-widget {
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;
        border-radius: 10px;

        box-sizing: border-box;
        width: 100%;

        overflow: hidden;
    }

    .clade-outline-widget.expanded.has-children,
    .clade-outline-widget:hover.has-children {
        border-radius: 10px 10px 6px 6px;
    }

    .relationships-and-child-cohorts-outer-container {
        min-height: 0.5rem;

        display: none;
    }

    .clade-outline-widget.expanded > .relationships-and-child-cohorts-outer-container, 
    .clade-outline-widget:hover > .relationships-and-child-cohorts-outer-container {
        display: flex;
        flex-direction: column;
    }
    

    .relationships-and-child-cohorts-outer-container:hover {
        min-height: 1.05rem;
    }

    .relationships-and-child-cohorts-inner-container {
        flex: 1 1 auto;
    }

    .relationships-outline-widget-container {
        position: relative;
        width: 100%;
        transform: scale(0.5);
        transform-origin: left;

        display: none;
    }

    .relationships-outline-widget-container.expanded.has-children {
        width: 100px;
        min-height: 100%;
        transform: scale(1);

        display: inline;
    }

    .relationships-and-child-cohorts-outer-container:hover > .relationships-and-child-cohorts-inner-container > .relationships-outline-widget-container {
        display: inline;
    }
</style>