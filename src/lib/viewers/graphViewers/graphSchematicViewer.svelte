<script lang="ts">
    import type { Graph, Generation } from "$lib/models/constructModels"
    
    import { Collapser } from "$lib/widgets/layoutWidgets"
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"

    export let graph: Graph

    const generationsWithIds: { id: number, generation: Generation }[] = []
    graph.generations.asArray.forEach(function (generation, id) {
        generationsWithIds.push( {id, generation} )
    })
</script>


<div class="graph-schematic-viewer">
    {#if generationsWithIds.length}
        <h4>{generationsWithIds.length} Generations:</h4>
    {/if}

    {#each generationsWithIds as {id, generation}}

        <div class="box">
            <Collapser headerText={`Generation ${id}`} expanded={true}>
                <div class="related-things-list">
                    {#each generation.members as member}
                        {#if member.thing?.dbModel}
                            <ThingDetailsWidget
                                thingDbModel={member.thing.dbModel}
                            />
                        {:else}
                            <div class="box">
                                ID: {member}
                            </div>
                        {/if}
                    {/each}
                </div>
            </Collapser>
        </div>

    {/each}
</div>


<style>
    .graph-schematic-viewer {
        border-radius: 0 0 5px 5px;

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

        scrollbar-width: thin;
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