<script lang="ts">
    import type { Thing, Note } from "./api/graph";
    import ThingWidget from "./thingWidget.svelte";
    

    let id: number | null = null;
    let text: string = "";
    let note: Note | null = null;
    let a_relations: Thing[] = [];
    let b_relations: Thing[] = [];

    export let thing: Thing;
    $: {
        thing;
        id = thing.id;
        text = thing.text;
        note = thing.note;
        if (Object.keys(thing).includes("a_relations")) {
            a_relations = thing.a_relations;
            b_relations = thing.b_relations;
        }
    }

    let offsets = [0, 0];
    let offsetLength = 250;

    export let generation = 0;
    $: {
        generation;
        offsets = [offsetLength * generation, offsetLength * generation];
    }

    let showNotes = false;
</script>


<main>
    <div class="box" style="left: {offsets[0]}px; top: {offsets[1]}px;">
        <h1>{text}</h1>
        {#if showNotes}
            {#if note}
                {@html note.text}
            {:else}
                <h2>NO NOTES YET</h2>
            {/if}
        {/if}
    </div>
    {#each a_relations as thing}
        <ThingWidget
            {thing}
            generation={generation + 1}
        />
    {/each}
    {#each b_relations as thing}
        <ThingWidget
            {thing}
            generation={generation + 1}
        />
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