<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Thing } from "$lib/shared/graph/constructs/thing"
    import { hoveredThingIdStore } from "$lib/shared/stores/appStores";
    import { retrieveGraphConstructs, graphConstructInStore } from "$lib/shared/stores/graphStores"
    import Toggle from "$lib/components/layoutElements/toggle.svelte"

    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    const dateDividerOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' } as const
    let useUniqueHistory = true

    function addDaysToDate(date: Date, days: number): Date {
        const newDate = new Date(date.getTime())
        newDate.setDate(date.getDate() + days)
        return newDate
    }

    function endOfDay(inputDate: Date) {
        const newDate = new Date(inputDate.getTime())
        newDate.setHours(23, 59, 59)
        return newDate
    }

    function getDatesBetweenTwoDates(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = []
        let currentDate = startDate
        while (currentDate <= endDate) {
            dates.push(endOfDay(currentDate))
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

    $: uniqueHistory = graph.perspectiveHistory.filter(
        (element, index, array) => {
            const historyThingIds = array.map(visitedThing => visitedThing.thingId)
            const firstIndexOfId = historyThingIds.indexOf(element.thingId)
            return firstIndexOfId === index
        }
    )
    $: historyToUse = useUniqueHistory ? uniqueHistory : graph.perspectiveHistory

    $: historyWithThings = historyToUse.map(
        (entry) => {
            return {
                timestamp: entry.timestamp,
                thingId: entry.thingId,
                thing: graphConstructInStore("Thing", entry.thingId) ? retrieveGraphConstructs("Thing", entry.thingId) : null
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
</script>


<main>
    <h4>History</h4>

    <div class="unique-toggle {useUniqueHistory ? "toggled": ""}">
        Unique
        <Toggle
            bind:toggled={useUniqueHistory}
        />
    </div>

    {#each reverseHistoryWithDateDividers as entryOrDivider}
        {#if "thingId" in entryOrDivider}
            {#if entryOrDivider.thing}
                <div
                    class="box { entryOrDivider.thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }"
                    on:mouseenter={()=>{ if (entryOrDivider) hoveredThingIdStore.set(entryOrDivider.thingId) }}
                    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
                    on:click={ () => { if (entryOrDivider) rePerspectToThingId(entryOrDivider.thingId)}
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
                <hr>
            </div>
        {/if}
        
        
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

    .unique-toggle {
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

    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;

        font-size: 0.65rem;
        text-align: left;
    }

    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .date-divider {
        margin-top: 1rem;

        text-align: left;
        font-size: 0.85rem;
    }
  </style>