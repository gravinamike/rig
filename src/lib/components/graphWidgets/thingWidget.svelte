<script context="module" lang="ts">
    import { spacesStore, thingsStore } from '$lib/shared/stores';

    // Component types and constants.
    export type HalfAxisId = 0 | 1 | 2 | 3 | 4;
    const halfAxisIds = [0, 1, 2, 3, 4] as const;
    const oddHalfAxisIds = [1, 3];
</script>

<script lang="ts">
    import type { Space, Thing, Note } from "$lib/shared/graph";
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"

    export let thingId: number | null = null;
    export let parentGeneration: number | null = null;
    export let parentSpace: Space | null = null;


    // Subscribe to Spaces and Things stores.
    let spacesStoreValue: { [id: number]: Space };
    spacesStore.subscribe(value => {spacesStoreValue = value});
    let thingsStoreValue: { [id: number]: Thing };
    thingsStore.subscribe(value => {thingsStoreValue = value});
    
    
    // Intrinsic (non-relational) attributes.
    let thing: Thing | null = null;
    let text: string = "";
    let note: Note | null = null;
    let showNotes = false;

    // Attributes related to parent relation.
    let generation = 0;

    // Attributes related to the Space child relations are rendered into.
    let defaultplane: number | null = null;
    let inheritSpace = false;
    let space: Space | null;
    let directionIdsByHalfAxisIds: { [halfAxisId: number]: number | null } = {};

    // Attributes related to child relations.
    let a_relations: Thing[] = [];
    let b_relations: Thing[] = [];
    let relations: Thing[] = [];

    // Attributes positioning child relations in their Space.
    let halfAxesWithThingIds: { id: HalfAxisId, thingIds: number[] }[] = [];


    // Reactive assignments...
    // ... for Thing's intrinsic attributes.
    $: thing = thingId && thingId in thingsStoreValue ? thingsStoreValue[thingId] : null;
    $: if (thing) {
        console.log("Changing...", thing.text)
        text = thing.text
        note = thing.note
    }
    // ... for the Thing's generation.
    $: if (parentGeneration) generation = parentGeneration + 1;
    // ... for the Space child relations are rendered into.
    $: {
        defaultplane = thing && thing.defaultplane ? thing.defaultplane : null;
    }
    $: if ( !inheritSpace && defaultplane && defaultplane in spacesStoreValue ) {
        space = spacesStoreValue[defaultplane];
    } else if (parentSpace) {
        space = parentSpace;
    } else {
        space = spacesStoreValue[1];//What if there is no spacesStoreValue[1]? Supply an empty Space.
    }
    $: if (space) {
        directionIdsByHalfAxisIds = {};
        for (const id of oddHalfAxisIds) {
            const direction = space.directions[(id - 1)/2];
            directionIdsByHalfAxisIds[id] = direction.id;
            directionIdsByHalfAxisIds[id + 1] = direction.oppositeid;
        }
    }
    // ... for child relations.
    $: if (thing && Object.keys(thing).includes("a_relations")) {
        a_relations = thing.a_relations;
        b_relations = thing.b_relations;
        relations = a_relations.concat(b_relations);
    }
    // ... for positioning child relations in their Space.
    function relationIdsForDirection(directionId: number): number[] {
        const relationsForDirection = relations.filter( (t) => (t.relationshipDirection === directionId) )
        const idsForDirection = relationsForDirection.map((x) => x.id)
        return idsForDirection
    }
    $: {
        relations;
        halfAxesWithThingIds = [];
        for (const halfAxisId of halfAxisIds) {
            const halfAxisWithThingIds = { id: halfAxisId, thingIds: relationIdsForDirection(halfAxisId) };
            if (halfAxisWithThingIds.thingIds.length) halfAxesWithThingIds.push(halfAxisWithThingIds);
        }
    }

    function handleClick() {
        console.log(thingId);
    }
</script>


<main class="thing-widget">
    
    <div class="thing-image" on:click={handleClick}>
        <h1>{thingId}: {text}</h1>
        {#if showNotes}
            {#if note}
                {@html note.text}
            {:else}
                <h2>NO NOTES YET</h2>
            {/if}
        {/if}
    </div>

    {#each halfAxesWithThingIds as halfAxis}
        <CohortWidget
            parentGeneration={generation}
            halfAxisId={halfAxis.id}
            parentSpace={space}
            thingIds={halfAxis.thingIds}
        />
    {/each}

</main>


<style>
    .thing-image {
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .thing-image:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
</style>