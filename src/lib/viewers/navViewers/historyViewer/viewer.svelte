<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"


    // Import constants.
    import { dateDividerOptions } from "$lib/shared/constants"

    // Import stores.
    import { hoveredThingIdStore } from "$lib/stores"

    // Import related widgets.
    import { Toggle } from "$lib/widgets/layoutWidgets"


    /**
     * @param graph - The Graph that this widget shows the history for.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    let useUniqueHistory = true

    $: historyToUse = graph.history.historyForViewer(useUniqueHistory)
</script>


<!-- History viewer. -->
<div class="history-viewer">

    <!-- Title. -->
    <div class="title">
        <h4>History</h4>
    </div>

    <!-- Toggle to use unique or full history. -->
    <div class="unique-toggle {useUniqueHistory ? "toggled": ""}">
        Unique
        <Toggle
            bind:toggled={useUniqueHistory}
        />
    </div>

    <!-- History list. -->
    <div class="content">
        {#each historyToUse as entryOrDivider}

            <!-- History entry. -->
            {#if "thingId" in entryOrDivider}

                <div
                    class="box"
                    class:hovered-thing={entryOrDivider.thingId === $hoveredThingIdStore}
                    class:id-not-found={!entryOrDivider.thing}

                    on:mouseenter={ () => {
                        if (
                            entryOrDivider
                            && "thingId" in entryOrDivider
                        ) hoveredThingIdStore.set(entryOrDivider.thingId)
                    } }
                    on:mouseleave={ () => {
                        hoveredThingIdStore.set(null)
                    } }
                    on:click={ () => {
                        if (
                            entryOrDivider
                            && "thingId" in entryOrDivider
                            && entryOrDivider.thing
                        ) rePerspectToThingId(entryOrDivider.thingId)
                    }
                }>
                    { entryOrDivider.thing?.text || `(THING ${entryOrDivider.thingId} NOT FOUND IN STORE)` }
                </div>

            <!-- Date divider. -->
            {:else}

                <div class="date-divider">
                    {entryOrDivider.timestamp.toLocaleDateString("en-US", dateDividerOptions)}
                    <hr>
                </div>

            {/if}
            
        {/each}
    </div>

</div>


<style>
    .history-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem 0 0.75rem 0;
        gap: 0.75rem;
        
        text-align: center;

        overflow: hidden;
    }

    .title {
        height: 20px;
    }

    h4 {
        margin: 0;
    }

    .unique-toggle {
        position: absolute;
        right: 5px;
        top: 16px;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: 5px;

        font-size: 0.75rem;
        color: lightgrey;
    }

    .unique-toggle.toggled {
        color: darkgrey;
    }

    .content {
        flex: 1 1 0;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;

        overflow-y: auto;
        scrollbar-width: thin;
    }

    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 10px;

        font-size: 0.75rem;
        text-align: left;

        cursor: default;
    }

    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .id-not-found {
        outline: dashed 1px black;
    }

    .date-divider {
        text-align: left;
        font-size: 0.85rem;
    }

    .date-divider:not(:first-child) {
        margin-top: 1rem;
    }
  </style>