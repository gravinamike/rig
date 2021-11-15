<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Thing } from "$lib/shared/graph/graphDb"
    import { retrieveThings, thingInStore, hoveredThingIdStore } from "$lib/shared/stores"

    export let graph: Graph

    const dateDividerOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' } as const

    function addDaysToDate(date: Date, days: number) {
        const newDate = new Date(date.getTime())
        newDate.setDate(date.getDate() + days)
        return newDate
    }

    function getDatesBetweenTwoDates(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = []
        let currentDate = startDate
        while (currentDate <= endDate) {
            dates.push(currentDate)
            currentDate = addDaysToDate(currentDate, 1)
        }
        return dates
    }

    interface HistoryEntryWithThing {
        timestamp: Date,
        thingId: number,
        thing: Thing | null
    }

    interface DateDivider {
        timestamp: Date
    }

    $: historyWithThings = graph.perspectiveHistory.map(
        (entry) => {
            return {
                timestamp: entry.timestamp,
                thingId: entry.thingId,
                thing: thingInStore(entry.thingId) ? retrieveThings(entry.thingId) : null
            }
        }
    )

    $: datesInHistory = historyWithThings.length ?
        getDatesBetweenTwoDates(historyWithThings[0].timestamp, historyWithThings[historyWithThings.length - 1].timestamp) :
        []
    $: dateDividers = datesInHistory.map((date) => {return {timestamp: date}})
    $: historyWithDateDividers = (historyWithThings as (HistoryEntryWithThing | DateDivider)[]).concat(dateDividers)
    $: reverseHistoryWithDateDividers = historyWithDateDividers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    async function handleClick(thingId: number) {
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addEntriesToHistory([thingId]) // Add this Thing to the History.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph = graph // Needed for reactivity.
    }
</script>


<main>
    <h4>History:</h4>

    {#each reverseHistoryWithDateDividers as entryOrDivider}
        {#if "thingId" in entryOrDivider}
            {#if entryOrDivider.thing}
                <div
                    class="box { entryOrDivider.thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }"
                    on:mouseenter={()=>{ if (entryOrDivider) hoveredThingIdStore.set(entryOrDivider.thingId) }}
                    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
                    on:click={ () => { if (entryOrDivider) handleClick(entryOrDivider.thingId)}
                }>
                    {entryOrDivider.thing.text}
                </div>
            {:else}
                <div>
                    THING {entryOrDivider.thingId} NOT FOUND IN STORE
                </div>
            {/if}
        {:else}
            <div class="date-divider">
                {entryOrDivider.timestamp.toLocaleDateString("en-US", dateDividerOptions)}
            </div>
        {/if}
        
        
    {/each}
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 225px;
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

        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;

        font-size: 0.75rem;
        text-align: left;
    }

    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .date-divider {
        margin: 1rem 0 1rem 0;

        font-size: 0.85rem;
    }
  </style>