<script lang="ts">
    import type { Generation, Graph } from "$lib/shared/graph/graph"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import ThingDetailsWidget from "$lib/components/graphWidgets/thingDetailsWidget.svelte"

    export let graph: Graph

    const generationsWithIds: { id: number, generation: Generation }[] = []
    graph.generations.forEach(function (generation, id) {
        generationsWithIds.push( {id, generation} )
    })
</script>


<main>
    {#each generationsWithIds as {id, generation}}

        <div class="box">
            <Collapser headerText={`Generation ${id}`} expanded={true}>
                {#each generation.members as member}
                    {#if "text" in member && member.thing}
                        <ThingDetailsWidget
                            thing={member.thing}
                        />
                    {:else}
                        <div class="box">
                            ID: {member.thingId}
                        </div>
                    {/if}
                {/each}
            </Collapser>
        </div>

    {/each}
</main>


<style>
    main {
        width: 225px;
        height: 100%;
        display: flex;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: center;
        background-color: #fafafa;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
    }
    .box {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0.75rem;
        height: max-content;
        font-size: 0.75rem;
        text-align: left;
        background-color: white;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
  </style>