<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Generation } from "$lib/shared/graph/generation"
    
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import ThingDetailsWidget from "$lib/components/graphWidgets/detailsWidgets/thingDetailsWidget.svelte"

    export let graph: Graph

    const generationsWithIds: { id: number, generation: Generation }[] = []
    graph.generations.forEach(function (generation, id) {
        generationsWithIds.push( {id, generation} )
    })
</script>


<main>
    {#if generationsWithIds.length}
        <h4>{generationsWithIds.length} Generations:</h4>
    {/if}

    {#each generationsWithIds as {id, generation}}

        <div class="box">
            <Collapser headerText={`Generation ${id}`} expanded={true}>
                <div class="related-things-list">
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
                </div>
            </Collapser>
        </div>

    {/each}
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
        
        text-align: center;
    }

    h4 {
        margin: 0;
    }

    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        box-sizing: border-box;
        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;

        font-size: 0.75rem;
        text-align: left;
    }

    .related-things-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
  </style>