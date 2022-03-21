<script context="module" lang="ts">
    import type { Graph, Cohort } from "$lib/models/graphModels"

    import { offsetsByHalfAxisId } from "$lib/shared/constants"
</script>

<script lang="ts">
    import { CladeWidget, ThingSpacerWidget } from "$lib/widgets/graphWidgets"

    export let cohort: Cohort
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    $: betweenThingGap = Math.max(0, 0.01 * graph.graphWidgetStyle.thingSpacingPercent * graph.graphWidgetStyle.thingSize)
    

    // Calculate x and y offsets and z-index relative to parent Thing Widget.
    const generationId = cohort.address?.generationId || 0
    const halfAxisId = cohort.address?.halfAxisId || 0
    const offsetSigns = offsetsByHalfAxisId[halfAxisId]

    $: planeId = cohort.plane?.id || 0
    $: offsets = [7, 8].includes(halfAxisId) ?
        [0, 0] :
        [
            graph.graphWidgetStyle.offsetLength * offsetSigns[0] + graph.planeOffsets[0] * planeId,
            graph.graphWidgetStyle.offsetLength * offsetSigns[1] + graph.planeOffsets[1] * planeId
        ]
    $: zIndex = (generationId * 2) * offsetSigns[2]




    
    
    $: rowOrColumn = [3, 4, 5, 6, 7, 8].includes(halfAxisId) ? "column" : "row"

    $: thingSize = graph.graphWidgetStyle.thingSize
    $: grandparentThingId = cohort.parentCohort()?.address.parentThingWidgetModel?.thingId || null
    $: indexOfGrandparentThing = grandparentThingId !== null ? 
        cohort.members.findIndex( member => member.thingId === grandparentThingId )
        : null
    $: offsetToGrandparentThing = indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1 ?
        ((cohort.members.length - 1)/2 - indexOfGrandparentThing) * (thingSize + betweenThingGap) :
        0
    $: offsetToGrandparentThingX = rowOrColumn === "row" ? offsetToGrandparentThing : 0
    $: offsetToGrandparentThingY = rowOrColumn === "column" ? offsetToGrandparentThing : 0


    
    // if (cohort.members.length === 1 && indexOfGrandparentThing)
</script>


<main
    class="cohort-widget"
    style="
        left: calc({offsets[0]}px + 50% + {offsetToGrandparentThingX}px);
        top: calc({offsets[1]}px + 50% + {offsetToGrandparentThingY}px);
        z-index: {zIndex};
        flex-direction: {rowOrColumn};
        gap: {[5, 6, 7, 8].includes(halfAxisId) ? 4 : betweenThingGap}px;
    "
>
    {#if !(cohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
        {#each cohort.members as cohortMember}
            {#if "text" in cohortMember}
                <CladeWidget
                    thingWidgetModel={cohortMember}
                    bind:graph
                    {rePerspectToThingId}
                />
            {:else}
                <ThingSpacerWidget
                    thingBaseWidgetModel={cohortMember}
                    {graph}
                />
            {/if}
        {/each}
    {/if}
</main>


<style>
    main {
        position: absolute;
        transform: translate(-50%, -50%);
        
        display: flex;

        pointer-events: none;
    }
</style>