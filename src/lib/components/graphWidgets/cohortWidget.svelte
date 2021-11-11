<script context="module" lang="ts">
    import type { Graph, Cohort } from "$lib/shared/graph/graph"
    import { offsetSignsByHalfAxisId } from "$lib/shared/constants"
</script>

<script lang="ts">
    import ThingWidget from "$lib/components/graphWidgets/thingWidget.svelte"
    import ThingPlaceholderWidget from "$lib/components/graphWidgets/thingPlaceholderWidget.svelte"

    export let cohort: Cohort
    export let graph: Graph

    $: betweenThingGap = graph.format.betweenThingGap

    // Calculate x and y offsets relative to parent Thing Widget.
    const halfAxisId = cohort.address ? cohort.address.halfAxisId : 0
    const offsetSigns = offsetSignsByHalfAxisId[halfAxisId]
    $: offsets = [ graph.format.offsetLength * offsetSigns[0], graph.format.offsetLength * offsetSigns[1] ]
</script>


<main class="cohort-widget" style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); flex-direction: {[3, 4].includes(halfAxisId) ? "column" : "row"}; gap: {betweenThingGap}px">
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