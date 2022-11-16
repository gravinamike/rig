<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { HistoryEntryWithThing, DateDivider } from "./utility"


    // Import constants.
    import { dateDividerOptions } from "$lib/shared/constants"

    // Import stores.
    import { graphDbModelInStore, getGraphConstructs, hoveredThingIdStore } from "$lib/stores"

    // Import utility functions.
    import { getDatesBetweenTwoDates } from "./utility"

    // Import related widgets.
    import { Toggle } from "$lib/widgets/layoutWidgets"


    /**
     * @param graph - The Graph that this widget shows the history for.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    let useUniqueHistory = true

    /*$: uniqueHistory = graph.history._entries.filter(
        (element, index, array) => {
            const historyThingIds = array.map(visitedThing => visitedThing.thingId)
            const firstIndexOfId = historyThingIds.indexOf(element.thingId)
            return firstIndexOfId === index
        }
    )
    $: historyToUse = useUniqueHistory ? uniqueHistory : graph.history._entries*/



    // Construct the history Thing list.
    $: historyWithThings = graph.history._entries.map(
        (entry) => {
            return {
                timestamp: entry.timestamp,
                thingId: entry.thingId,
                thing: graphDbModelInStore("Thing", entry.thingId) ? getGraphConstructs("Thing", entry.thingId) : null
            }
        }
    )

    // Construct a list of date dividers for all dates in the history.
    $: datesInHistory =
        historyWithThings.length ? getDatesBetweenTwoDates(
            historyWithThings[0].timestamp,
            historyWithThings[historyWithThings.length - 1].timestamp
        ) :
        []
    $: dateDividers = datesInHistory.map((date) => {return {timestamp: date}})

    // Add the date divider list to the end of the history Thing list.
    $: historyWithDateDividers =
        (historyWithThings as (HistoryEntryWithThing | DateDivider)[]).concat(dateDividers)
    
    // Sort the history Thing/date divider list in reverse order.
    $: reverseHistoryWithDateDividers =
        historyWithDateDividers.sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )

    $: uniqueReverseHistoryWithDateDividers = 
        reverseHistoryWithDateDividers.filter(
            (element, index, array) => {

                if ("thingId" in element) {
                    const historyThingIds = array.map(
                        visitedThing => "thingId" in visitedThing ? visitedThing.thingId : "divider"
                    )
                    const firstIndexOfId = historyThingIds.indexOf(element.thingId)
                    return firstIndexOfId === index
                } else {
                    return true
                }
                
            }
        )
    
    $: historyToUse =
        useUniqueHistory ? uniqueReverseHistoryWithDateDividers :
        reverseHistoryWithDateDividers
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