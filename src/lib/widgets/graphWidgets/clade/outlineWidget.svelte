<script lang="ts">    
    // Import types.
    import type { Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants and utility functions.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import {
        RelationshipCohortOutlineWidget, ThingCohortOutlineWidget,
        ThingOutlineWidget, ThingFormOutlineWidget
    } from "$lib/widgets/graphWidgets"
    import { reorderingInfoStore } from "$lib/stores";
    

    /**
     * @param {Thing} rootThing - The Thing that forms the root of the Clade.
     * @param {Graph} graph - The Graph that the Clade is in.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the visual styling of the Graph widget.
     * @param {boolean} isFinalClade - Whether this is the final Clade for this parent Thing.
     * @param {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let rootThing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let isFinalClade = false
    export let rePerspectToThingId: (id: number) => Promise<void>
    

    // Handles for widget dimensions.
    let relationshipsAndChildCohortsHeight = 1


    // Attributes managed by widget controller.
    let thingCohorts: ThingCohort[] = []
    let showCladeRootThing: boolean
    let orderedThingCohorts: ThingCohort[] = []



    /**
     * Expandable flag.
     * 
     * Determines whether the Clade can be collapsed to hide children or
     * expanded to show them.
     */
    $: expandable = (
        thingCohorts.length
        && thingCohorts[0].generation
        && !thingCohorts[0].generation.isRelationshipsOnly
    ) ? true :
    false

    $: expanded =
        expandable && rootThing.address.generationId === 0 ? true :
        false


    $: childThings = (
        thingCohorts
            .map(thingCohort => thingCohort.members).flat()
            .filter(thingCohortMember => thingCohortMember.thing !== null)
        ) as unknown as Thing[]

    




        

    // Toggle state attributes.
    let toggleHovered = false
    $: showToggle = ((!$reorderingInfoStore.reorderInProgress && toggleHovered) || expanded)

    $: orderedThingCohortsWithMembers = orderedThingCohorts.filter(
        thingCohort => thingCohort.members.length
    )


</script>


<!-- Widget controller. -->
<CladeWidgetController
    {rootThing}
    {graphWidgetStyle}

    bind:thingCohorts
    bind:showCladeRootThing
    bind:orderedThingCohorts
/>


<!-- Clade outline widget.-->
<div
    class="clade-outline-widget"
    class:expanded
    class:has-children={thingCohorts.length}
>

    <!-- Root Thing. -->
    {#if showCladeRootThing}

        <div class="root-thing-and-children-indicator-container">

            {#if showCladeRootThing && expandable}
                <div
                    class="children-indicator-container"

                    on:click={() => expanded = !expanded}
                    on:keyup={() => {}}
                    on:mouseenter={() => toggleHovered = true}
                    on:mouseleave={() => toggleHovered = false}
                >
                    <!-- Children-Things indicator. -->
                    {#if !expanded}
                        +{childThings.length}
                    {/if}

                    <!-- Visible toggle image. -->
                    {#if showToggle}
                        <svg
                            class="relationship-arrow-root"

                            style="width: 32px; height: 32px;"
                        >
                            <path
                                d="M 16 32 A 16 16 0 0 1 32 16"
                                style="stroke-width: 10;"
                            />
                            {#if !expanded}
                                <polygon
                                    points="10,30 20,30 15,35"
                                    style="stroke-width: 3;"
                                />
                            {/if}
                        </svg>
                    {/if}



                </div>
            {/if}
            
            <div class="root-thing-container">
                <!-- If the root Thing is specified, show a Thing Widget. -->
                {#if rootThing?.id}
                    <ThingOutlineWidget
                        thingId={rootThing.id}
                        thing={rootThing}
                        {graph}
                        {graphWidgetStyle}
                        {rePerspectToThingId}
                    />

                <!-- Otherwise, show a Thing-Form Widget. -->
                {:else}
                    <ThingFormOutlineWidget
                        thing={rootThing}
                        bind:graph
                        {graphWidgetStyle}
                    />
                {/if}
            </div>

        </div> 

    {/if}

    <!-- The Thing's Relationships and child Cohorts (outer containers). -->
    {#each orderedThingCohortsWithMembers as thingCohort, i (thingCohort.address)}  
        <div
            class="relationships-and-child-cohorts-outer-container"
        >

            <!-- Relationship color field. -->
            <div
                class="relationship-color-field"

                style="
                    top: 1.5px;
                    height: calc(100% - 2px);
                    background-color: {relationshipColorByHalfAxisId[thingCohort.halfAxisId] || "dimgrey"};
                "
            />

            <!-- The Thing's Relationships and child Cohorts (inner container). -->
            <div
                class="relationships-and-child-cohorts-inner-container"
                bind:clientHeight={relationshipsAndChildCohortsHeight}
                
                style="flex-direction: { expanded ? "row" : "column" };"
            >

                <!-- Relationship Cohort Widget. -->
                <div
                    class="relationships-outline-widget-container"
                    class:expanded
                    class:has-children={thingCohort.members.length}
                >
                    {#if !graph.offAxis}
                        <!-- Relationship arrow segment. -->
                        <div
                            class="relationship-arrow-segment"

                            style="
                                position: absolute;
                                left: 10px;
                                width: 10px;
                                height: {
                                    (
                                        isFinalClade
                                        && i === orderedThingCohortsWithMembers.length - 1
                                    ) ? 20 :
                                    100
                                }%;
                                background-color: {relationshipColorByHalfAxisId[thingCohort.halfAxisId] || "dimgrey"};
                                opacity: 0.5;
                            "
                        />
                    {/if}

                    <RelationshipCohortOutlineWidget
                        {thingCohort}
                        directionWidgetIsRotated={thingCohort.members.length >= 3}
                        bind:graph
                        {graphWidgetStyle}
                    />
                </div>

                <!-- Thing Cohort Widget. -->
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
        border-radius: 10px;

        box-sizing: border-box;
        width: 100%;

        overflow: hidden;
    }

    .clade-outline-widget.expanded.has-children {
        border-radius: 6px;
    }

    .root-thing-and-children-indicator-container {
        display: flex;
        flex-direction: row;
    }

    .root-thing-container {
        flex: 1 1 0;
    }

    .children-indicator-container {
        width: 30px;

        display: flex;
        align-items: center;
        justify-content: center;

        cursor: pointer;
    }

    .relationships-and-child-cohorts-outer-container {
        border-radius: 5px;

        position: relative;
        min-height: 0.5rem;

        display: none;
    }

    .clade-outline-widget.expanded > .relationships-and-child-cohorts-outer-container {
        display: flex;
        flex-direction: column;
    }

    .relationships-and-child-cohorts-outer-container:hover {
        position: relative;
    }

    .relationships-and-child-cohorts-outer-container:hover {
        min-height: 1.05rem;
    }

    .relationship-color-field {
        border-radius: 5px;

        position: absolute;
        width: 100%;
        opacity: 0.25;
    }

    .relationships-and-child-cohorts-inner-container {
        display: flex;
        flex: 1 1 auto;
    }

    .relationships-outline-widget-container {
        position: relative;
        transform: scale(0.5);
        transform-origin: left;

        display: none;
    }

    .relationships-outline-widget-container:not(.expanded.has-children) {
        width: 100%;
    }

    .relationships-outline-widget-container.expanded.has-children {
        width: fit-content;
        min-height: 100%;
        transform: scale(1);

        display: inline;
    }

    .relationships-and-child-cohorts-outer-container:hover > .relationships-and-child-cohorts-inner-container > .relationships-outline-widget-container {
        display: inline;
    }



    


    .relationship-arrow-root {
        position: absolute;
        
        stroke: dimgrey;
        fill: dimgrey;
        opacity: 0.5;

        overflow: visible;
    }
</style>