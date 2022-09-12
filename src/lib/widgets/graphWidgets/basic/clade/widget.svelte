<script lang="ts">
    // Widget model imports.
    import type { GraphWidgetModel } from "$lib/models/widgetModels"
    import type { ThingWidgetController } from "$lib/widgets/graphWidgets"
    import CladeWidgetController from "./controller.svelte"

    // Graph widget imports.
    import { ThingWidget, ThingFormWidget, RelationshipCohortWidget, ThingCohortWidget, OffAxisRelationsWidget } from "$lib/widgets/graphWidgets"
    import type { Note } from "$lib/models/constructModels"
    import type { ThingCohortWidgetModel } from "..";

    export let graphWidgetModel: GraphWidgetModel
    export let rePerspectToThingId: (id: number) => Promise<void>

    let submodels: {
            rootThing: ThingWidgetController,
            childThingCohorts: ThingCohortWidgetModel[]
            childRelationshipCohortsByHalfAxisId: { [directionId: number]: RelationshipCohortWidgetModel }
        }
    let note: Note | null
    let overlapMarginStyleText: string


    $: rootThing = submodels.rootThing
    $: childThingCohorts = submodels.childThingCohorts
    $: childRelationshipCohortsByHalfAxisId = submodels.childRelationshipCohortsByHalfAxisId
    $: note = note


    const showNotes = false
</script>








<CladeWidgetController
    {graphWidgetModel}
    {rootThingWidgetModel}

    bind:submodels
    bind:note
    bind:overlapMarginStyleText
/>








<!-- Clade widget.-->
<div
    class="clade-widget"
    style="{overlapMarginStyleText}"
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