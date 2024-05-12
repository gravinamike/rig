<script lang="ts">    
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import CladeWidgetController from "./controller.svelte"

    // Import related widgets.
    import {
        HalfAxisOutlineWidget, ThingOutlineWidget, ThingFormOutlineWidget, UnshownRelationsIndicators
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
    export let outlineScrollAreaTop: number
    export let outlineScrollTime: Date | null
    export let editingNotes: boolean
    export let notesEditor: Editor | null
    export let rePerspectToThingId: (id: number) => Promise<void>
    


    // Attributes managed by widget controller.
    let thingCohorts: ThingCohort[] = []
    let orderedThingCohorts: ThingCohort[] = []
    let orderedThingCohortsWithMembers: ThingCohort[] = []
    let childThings: Thing[] = []
    let showCladeRootThing: boolean
    





    let rootThingHovered = false

</script>


<!-- Widget controller. -->
<CladeWidgetController
    {graph}
    {rootThing}
    {graphWidgetStyle}

    bind:thingCohorts
    bind:orderedThingCohorts
    bind:orderedThingCohortsWithMembers
    bind:childThings
    bind:showCladeRootThing
/>


<!-- Clade outline widget.-->
<div
    class="clade-outline-widget"
    class:off-axis={graph.offAxis}
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
                    {outlineScrollAreaTop}
                    {outlineScrollTime}
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
        </div>
    {/if}

    <!-- The Thing's Relationships and child Thing Cohorts (outer containers). -->
    {#each orderedThingCohortsWithMembers as thingCohort (thingCohort.address)}
        {#if
            // Render the half-axis widget if the Thing Cohort's `shouldBeRendered` flag is set.
            thingCohort.shouldBeRendered
        }
            <!-- Half-axis widget. -->
            <HalfAxisOutlineWidget
                {thingCohort}
                bind:graph
                {graphWidgetStyle}
                {outlineScrollAreaTop}
                {outlineScrollTime}
                {editingNotes}
                {notesEditor}
                {rePerspectToThingId}
            />
        {/if}
    {/each}

    <!-- Unshown-relations indicators. -->
    <UnshownRelationsIndicators
        parentThing={rootThing}
        directionId={"outline"}
        halfAxisId={null}
        thingCohorts={orderedThingCohortsWithMembers}
        thingSize={null}
        {graphWidgetStyle}
    />
</div>


<style>
    .clade-outline-widget {
        border-radius: 7px;
        
        box-sizing: border-box;
        position: relative;
        width: 100%;

        overflow: hidden;
    }

    .clade-outline-widget:not(.off-axis) {
        border-radius: 0;

        overflow: visible;
    }

    .root-thing-container {
        flex: 1 1 0;

        position: relative;

        overflow: visible;
    }
</style>