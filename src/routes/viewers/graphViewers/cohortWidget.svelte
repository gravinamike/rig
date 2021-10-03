<script context="module" lang="ts">
    // Component types and constants.
    import type { HalfAxisId } from "./thingWidget.svelte"
    const offsetSignsByHalfAxisId = { 0: [0, 0], 1: [0, 1], 2: [0, -1], 3: [1, 0], 4: [-1, 0] };
</script>

<script lang="ts">
    import type { Space, Thing } from "$lib/graph";
    import ThingWidget from "./thingWidget.svelte";

    export let parentGeneration: number | null;
    export let halfAxisId: HalfAxisId;
    export let parentSpace: Space | null;
    export let things: Thing[];

    let offsetLength = 250;
    let offsets = [0, 0];

    $: {
        const offsetSigns = offsetSignsByHalfAxisId[halfAxisId];
        offsets = [offsetLength * offsetSigns[0], offsetLength * offsetSigns[1]];
    }
</script>


<main style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); flex-direction: {[3, 4].includes(halfAxisId) ? "column" : "row"};">
    {#each things as thing}
        <ThingWidget
            {thing}
            {parentGeneration}
            {parentSpace}
        />
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