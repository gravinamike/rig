<script context="module" lang="ts">
    import { spacesStore } from '../../__layout.svelte';

    // Component types and constants.
    export type HalfAxisId = 0 | 1 | 2 | 3 | 4;
    const halfAxisIds = [0, 1, 2, 3, 4] as const;
    const oddHalfAxisIds = [1, 3];

    // Subscribe to Spaces store.
    let spacesStoreValue: { [id: number]: Space };
    spacesStore.subscribe(value => {spacesStoreValue = value});
</script>

<script lang="ts">
    import type { Space, Thing, Note } from "$lib/graph";
    import CohortWidget from "./cohortWidget.svelte"

    export let thing: Thing;
    export let parentGeneration: number | null = null;
    export let parentSpace: Space | null = null;
    
    
    // Intrinsic (non-relational) attributes.
    let id: number | null = null;
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
    let halfAxesWithThings: { id: HalfAxisId, things: Thing[] }[] = [];


    // Reactive assignments...
    // ... for Thing's intrinsic attributes.
    $: {
        id = thing.id;
        text = thing.text;
        note = thing.note;
    }
    // ... for the Thing's generation.
    $: if (parentGeneration) generation = parentGeneration + 1;
    // ... for the Space child relations are rendered into.
    $: {
        defaultplane = thing.defaultplane ? thing.defaultplane : null;
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
    $: if (Object.keys(thing).includes("a_relations")) {
        a_relations = thing.a_relations;
        b_relations = thing.b_relations;
        relations = a_relations.concat(b_relations);
    }
    // ... for positioning child relations in their Space.
    function relationsForDirection(directionId: number): Thing[] {
        return relations.filter( (t) => (t.relationshipDirection === directionId) );
    }
    $: {
        relations;
        halfAxesWithThings = [];
        for (const halfAxisId of halfAxisIds) {
            const halfAxisWithThings = { id: halfAxisId, things: relationsForDirection(halfAxisId) };
            if (halfAxisWithThings.things.length) halfAxesWithThings.push(halfAxisWithThings);
        }
    }

    function handleClick() {
        console.log(id);
    }
</script>


<main>
    
    <div class="box" on:click={handleClick}>
        <h1>{id}: {text}</h1>
        {#if showNotes}
            {#if note}
                {@html note.text}
            {:else}
                <h2>NO NOTES YET</h2>
            {/if}
        {/if}
    </div>

    {#each halfAxesWithThings as halfAxis}
        <CohortWidget
            parentGeneration={generation}
            halfAxisId={halfAxis.id}
            parentSpace={space}
            things={halfAxis.things}
        />
    {/each}

</main>


<style>
    .box {
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
</style>