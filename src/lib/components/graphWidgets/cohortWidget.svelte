<script context="module" lang="ts">
    const offsetSignsByHalfAxisId = { 0: [0, 0], 1: [0, 1], 2: [0, -1], 3: [1, 0], 4: [-1, 0] } as const
    const offsetLength = 250
</script>

<script lang="ts">
    import type { Graph, Cohort } from "$lib/shared/graph/graph"
    import ThingWidget from "$lib/components/graphWidgets/thingWidget.svelte"
    import ThingPlaceholderWidget from "$lib/components/graphWidgets/thingPlaceholderWidget.svelte"

    export let cohort: Cohort
    export let graph: Graph

    const halfAxisId = cohort.address ? cohort.address.halfAxisId : 0
    const offsetSigns = offsetSignsByHalfAxisId[halfAxisId]
    const offsets = [offsetLength * offsetSigns[0], offsetLength * offsetSigns[1]]
</script>


<main class="cohort-widget" style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); flex-direction: {[3, 4].includes(halfAxisId) ? "column" : "row"};">
    {#each cohort.members as cohortMember}
        {#if cohortMember.kind === "thingWidgetModel"}
            <ThingWidget
                thingWidgetModel={cohortMember}
                {graph}
            />
        {:else}
            <ThingPlaceholderWidget />
        {/if}
    {/each}
</main>


<style>
    main {
        position: absolute;
        transform: translate(-50%, -50%);
        display: flex;
        gap: 20px;
    }
</style>