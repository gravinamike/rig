<script lang="ts">    
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import {
        RelationshipCohortOutlineWidget, ThingCohortOutlineWidget,
        ThingOutlineWidget, ThingFormOutlineWidget
    } from "$lib/widgets/graphWidgets"
    


    /**
     * @param rootThing - The Thing that forms the root of the Clade.
     * @param graph - The Graph that the Clade is in.
     * @param graphWidgetStyle - Controls the visual styling of the Graph widget.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let rootThing: Thing
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let editingNotes: boolean
    export let notesEditor: Editor | null
    export let rePerspectToThingId: (id: number) => Promise<void>
    


    // Attributes managed by widget controller.
    let thingCohorts: ThingCohort[] = []
    let orderedThingCohorts: ThingCohort[] = []
    let orderedThingCohortsWithMembers: ThingCohort[] = []
    let childThings: Thing[] = []
    let showCladeRootThing: boolean
    let expandable: boolean
    let expanded: boolean
    let showToggle: boolean
    

    // Whether the expand-/collapse-Clade toggle is hovered.
    let toggleHovered = false





    let rootThingHovered = false

</script>


<!-- Widget controller. -->
<CladeWidgetController
    {graph}
    {rootThing}
    {graphWidgetStyle}
    {toggleHovered}

    bind:thingCohorts
    bind:orderedThingCohorts
    bind:orderedThingCohortsWithMembers
    bind:childThings
    bind:showCladeRootThing
    bind:expandable
    bind:expanded
    bind:showToggle
/>


<!-- Clade outline widget.-->
<div
    class="clade-outline-widget"
    class:off-axis={graph.offAxis}
    class:expanded
    class:has-children={thingCohorts.length > 0}
>
    <!-- Root Thing (and indicator of its child Things). -->
    {#if showCladeRootThing}
            
            <!-- Root Thing. -->
            <div
                class="root-thing-container"

                on:mouseenter={() => rootThingHovered = true}
                on:mouseleave={() => rootThingHovered = false}
            >
                <!-- If the root Thing is specified, show a Thing Widget. -->
                {#if rootThing?.id}
                    <ThingOutlineWidget
                        thingId={rootThing.id}
                        thing={rootThing}
                        {graph}
                        {graphWidgetStyle}
                        bind:editingNotes
                        bind:notesEditor
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

                <!-- Child Things indicator/toggle. -->
                {#if showCladeRootThing && rootThingHovered && expandable}
                    <div
                        class="children-indicator-container"

                        on:click={() => expanded = !expanded}
                        on:keyup={() => {}}
                        on:mouseenter={() => toggleHovered = true}
                        on:mouseleave={() => toggleHovered = false}
                    >
                        <!-- Children-Things quantity indicator. -->
                        {#if !expanded}
                            +{childThings.length}
                        {/if}

                        <!-- Expand/collapse toggle. -->
                        {#if showToggle && expanded}
                            <svg class="relationship-toggle-arrow">
                                <path d="M 4 7 L 10 13 L 16 7" />
                            </svg>
                        {/if}
                    </div>
                {/if}
            </div>

    {/if}

    <!-- The Thing's Relationships and child Thing Cohorts (outer containers). -->
    {#each orderedThingCohortsWithMembers as thingCohort, i (thingCohort.address)}  
        <div class="relationships-and-child-cohorts-outer-container">
            <!-- Relationship color field. -->
            <div
                class="relationship-color-field"

                style="background-color: {relationshipColorByHalfAxisId[thingCohort.halfAxisId] || "dimgrey"};"
            />

            <!-- The Thing's Relationships and child Thing Cohorts (inner container). -->
            <div
                class="relationships-and-child-cohorts-inner-container"
                
                style="flex-direction: { expanded ? "row" : "column" };"
            >

                <!-- Relationship Cohort Widget. -->
                <div
                    class="relationships-outline-widget-container"
                    class:expanded
                    class:has-children={thingCohort.members.length}
                >
                    <!-- Relationship Cohort outline widget. -->
                    <RelationshipCohortOutlineWidget
                        {thingCohort}
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
                        bind:editingNotes
                        bind:notesEditor
                        {rePerspectToThingId}
                    />
                {/if}
            </div>
        </div>
    {/each}
</div>


<style>
    .clade-outline-widget {
        border-radius: 7px;

        box-sizing: border-box;
        width: 100%;

        overflow: hidden;
    }

    .clade-outline-widget:not(.off-axis) {
        border-radius: 0;

        overflow: visible;
    }

    .clade-outline-widget.expanded.has-children {
        border-radius: 6px;
    }

    .clade-outline-widget.expanded:not(.off-axis).has-children {
        border-radius: 0;
    }

    .root-thing-container {
        flex: 1 1 0;

        position: relative;

        overflow: visible;
    }

    .children-indicator-container {
        border-radius: 50%;

        position: absolute;
        left: 33px;
        top: calc(100%);
        width: 20px;
        height: 20px;
        transform: translate(-50%, -50%);
        z-index: 1;
        background-color: silver;
        opacity: 50%;

        display: flex;
        align-items: center;
        justify-content: center;

        cursor: pointer;
    }

    .children-indicator-container:hover {
        opacity: 80%;
    }

    .children-indicator-container:active {
        opacity: 100%;
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

    .relationship-toggle-arrow {
        position: absolute;
        width: 20px;
        height: 20px;
        transform: scale(1, -1);
        
        stroke: dimgrey;
        stroke-width: 3;
        fill: transparent;

        overflow: visible;
    }

    .relationship-color-field {
        position: absolute;
        height: 100%;
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

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .relationships-and-child-cohorts-outer-container:hover
    > .relationships-and-child-cohorts-inner-container
    > .relationships-outline-widget-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>