<script lang="ts">    
    // Constant imports.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Utility imports.
    import { hexToRgba } from "$lib/shared/utility"

    // Graph widget imports.
    import { ThingOutlineWidget, ThingFormOutlineWidget, RelationshipCohortOutlineWidget, ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"
    import type { Graph, Thing, ThingCohort } from "$lib/models/constructModels";


    export let rootThing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (id: number) => Promise<void>
    

    // Cohort-related variables.
    $: thingCohorts = rootThing.childThingCohorts


    // Thing Cohorts are ordered in a specific way:
    // 1. First those on the "Cartesian" half-axes, from top to bottom and left to right,
    // 2. Then those on the other half-axes,
    // 3. Then all those not on a half-axis.
    function getOrderedThingCohorts(
        thing: Thing,
        excludeHalfAxes=graphWidgetStyle.excludeCartesianAxes
    ): ThingCohort[] {

        const orderedHalfAxisIds = [2, 1, 4, 3, 5, 6, 8, 7]
        const allCohortGroups: ThingCohort[][] = []

        if (!excludeHalfAxes) {
            // Get an array of the half-axis IDs that currently have Cohorts.
            
            const orderedHalfAxisIdsWithThings = orderedHalfAxisIds.filter(
                id => id in thing.childCohortsByHalfAxisId
            )

            const thingCohortsOnHalfAxes: ThingCohort[] = []
            for (const halfAxisId of orderedHalfAxisIdsWithThings) {
                thingCohortsOnHalfAxes.push(thing.childCohortsByHalfAxisId[halfAxisId])
            }

            allCohortGroups.push(thingCohortsOnHalfAxes)
        }
        
        const thingCohortsNotOnHalfAxes = thing.childThingCohorts
            .filter(cohort => !(cohort.halfAxisId && orderedHalfAxisIds.includes(cohort.halfAxisId)))


        allCohortGroups.push(thingCohortsNotOnHalfAxes)

        const orderedThingCohorts = allCohortGroups.flat()
        return orderedThingCohorts
    }
    $: orderedThingCohorts = getOrderedThingCohorts(rootThing)
    



    $: expanded = (
        thingCohorts.length
        && thingCohorts[0].generation
        && !thingCohorts[0].generation.isRelationshipsOnly
    ) ?
        true :
        false

    $: shadowColor = relationshipColorByHalfAxisId[rootThing.parentCohort.halfAxisId]


    $: showCladeRootThing = (
        rootThing.address.generationId === 0
        && graphWidgetStyle.excludePerspectiveThing
    ) ?
        false :
        true



    // Attributes managed by the widget controller.
    let overlapMarginStyleText: string
</script>



<!-- Widget controller. -->
<CladeWidgetController
    {rootThing}
    {graphWidgetStyle}

    bind:overlapMarginStyleText
/>




<!-- Clade widget.-->
<div
    class="clade-outline-widget"
    class:expanded
    class:has-children={thingCohorts.length}
    style="box-shadow: 5px 5px 10px 2px {hexToRgba(shadowColor, 0.333)};"
>

    {#if showCladeRootThing}
        {#if rootThing}
            <ThingOutlineWidget
                thingId={rootThing.id}
                {graph}
                {graphWidgetStyle}
                {rePerspectToThingId}
            />
        {:else}
            <ThingFormOutlineWidget
                thing={rootThing}
                bind:graph
                {graphWidgetStyle}
            /><!-- Root Thing needs to be replaced with some kind of placeholder "Form" Thing. -->
        {/if}
    {/if}

    <!-- The Thing's Relationships and child Cohorts (outer container). -->
    {#each orderedThingCohorts as thingCohort (thingCohort.address)}  
        <div
            class="relationships-and-child-cohorts-outer-container"
            style="
                position: relative;
                background-color: white;
            "
        >
            <!-- Relationship color field. -->
            <div
                style="
                    border-top: dotted 1px grey;
                    box-sizing: border-box;
                    position: absolute; width: 100%; height: 100%;
                    background-color: {relationshipColorByHalfAxisId[thingCohort.halfAxisId]};
                    opacity: 0.25;
                "
            />

            <!-- The Thing's Relationships and child Cohorts (inner container). -->
            <div
                class="relationships-and-child-cohorts-inner-container"
                style="flex-direction: { expanded ? "row" : "column" };"    
            >
                <!-- Relationships Widget. -->
                {#if thingCohort.halfAxisId}
                    <div
                        class="relationships-outline-widget-container"
                        class:expanded
                        class:has-children={thingCohort.members.length}
                    >
                        <RelationshipCohortOutlineWidget
                            {thingCohort}
                            bind:graph
                            {graphWidgetStyle}
                        />
                    </div>
                {/if}

                <!-- Cohort Widget. -->
                {#if (
                    thingCohort.members.length
                    && thingCohort.generation
                    && !thingCohort.generation.isRelationshipsOnly
                )}
                    <ThingCohortOutlineWidget
                        {thingCohort}
                        bind:graph
                        bind:graphWidgetStyle
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
        display: flex;
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