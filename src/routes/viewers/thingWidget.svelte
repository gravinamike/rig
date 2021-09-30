<script context="module" lang="ts">
    // Component constants and stores.
    const halfAxisIds = [0, 1, 2, 3, 4] as const;
    const oddHalfAxisIds = [1, 3];
    const offsetSignsByHalfAxisId = { 0: [0, 0], 1: [0, 1], 2: [0, -1], 3: [1, 0], 4: [-1, 0] };
    
    /*let spacesStore: { [id: number]: Space }; ///////////// POSSIBLE THIS SHOULD BE DONE IN A LOAD FUNCTION?
    export async function load() {
        spaces.subscribe(value => { spacesStore = value; });
    }*/
</script>

<script lang="ts">
    import type { Space, Direction, Thing, Note } from "../api/graph";
    //import { spaces } from '../__layout.svelte';
    import ThingWidget from "./thingWidget.svelte";

    export let thing: Thing;
    export let parentGeneration: number | null = null;
    export let parentSpace: Space | null = null;
    export let halfAxisId: 0 | 1 | 2 | 3 | 4 = 0;
    export let spacesStore: { [id: number]: Space };
    
    
    // Intrinsic (non-relational) attributes.
    let id: number | null = null;
    let text: string = "";
    let note: Note | null = null;
    let showNotes = false;

    // Attributes related to parent relation.
    let generation = 0;

    // Attributes related to the parent relation's Space (which this Thing is rendered into).
    let offsetLength = 250;
    let offsets = [0, 0];

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
    let halfAxesWithThings: { id: 0 | 1 | 2 | 3 | 4, things: Thing[] }[] = [];


    // Reactive assignments...
    // ... for Thing's intrinsic attributes.
    $: {
        id = thing.id;
        text = thing.text;
        note = thing.note;
    }
    // ... for the Thing's generation.
    $: if (parentGeneration) generation = parentGeneration + 1;
    // ... for the parent relation's Space (which this Thing is rendered into).
    $: {
        const offsetSigns = offsetSignsByHalfAxisId[halfAxisId];
        offsets = [offsetLength * offsetSigns[0], offsetLength * offsetSigns[1]];
    }
    // ... for the Space child relations are rendered into.
    $: {
        defaultplane = thing.defaultplane ? thing.defaultplane : null;
        //console.log('DEFAULTPLANE', defaultplane, spacesStore);
    }
    $: if ( !inheritSpace && defaultplane && defaultplane in spacesStore ) {
        space = spacesStore[defaultplane];
    } else if (parentSpace) {
        space = parentSpace;
    } else {
        space = spacesStore[1];//What if there is no spacesStore[1]? Supply an empty Space.
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
            const directionId = directionIdsByHalfAxisIds[halfAxisId];
            const halfAxisWithThings = { id: halfAxisId, things: relationsForDirection(halfAxisId) };
            halfAxesWithThings.push(halfAxisWithThings);
        }
    }
</script>


<main>
    <div class="box" style="left: {offsets[0]}px; top: {offsets[1]}px;">
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
        <!-- THIS IS THE PLACE WHERE THE COHORT SHOULD GO, WITH THE OFFSETS. -->
        {#each halfAxis.things as thing}
            <ThingWidget
                {thing}
                parentGeneration={generation}
                parentSpace={space}
                halfAxisId={halfAxis.id}
                {spacesStore}
            />
        {/each}
    {/each}
</main>


<style>
    .box {
        width: 50px;
        height: 50px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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