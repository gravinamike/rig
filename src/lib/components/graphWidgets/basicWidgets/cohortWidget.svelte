<script context="module" lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Cohort } from "$lib/shared/graph/cohort"

    import { offsetsByHalfAxisId } from "$lib/shared/constants"
</script>

<script lang="ts">
    import ThingWidget from "$lib/components/graphWidgets/basicWidgets/thingWidget.svelte"
    import ThingPlaceholderWidget from "$lib/components/graphWidgets/basicWidgets/thingPlaceholderWidget.svelte"

    export let cohort: Cohort
    export let graph: Graph

    $: betweenThingGap = Math.max(0, graph.graphWidgetStyle.betweenThingGap)

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
</script>


<main
    class="cohort-widget"
    style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); z-index: {zIndex}; flex-direction: {[3, 4, 5, 6, 7, 8].includes(halfAxisId) ? "column" : "row"}; gap: {[5, 6, 7, 8].includes(halfAxisId) ? 4 : betweenThingGap}px;"
>
    {#each cohort.members as cohortMember}
        {#if "text" in cohortMember}
            <ThingWidget
                thingWidgetModel={cohortMember}
                bind:graph
            />
        {:else}
            <ThingPlaceholderWidget
                thingPlaceholderWidgetModel={cohortMember}
            />
        {/if}
    {/each}
</main>


<style>
    main {
        position: absolute;
        transform: translate(-50%, -50%);
        
        display: flex;
    }
</style>