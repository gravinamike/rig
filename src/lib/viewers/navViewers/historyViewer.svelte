<script lang="ts">
    import type { Thing, Graph } from "$lib/models/constructModels"
    import { hoveredThingIdStore, graphDbModelInStore, getGraphConstructs } from "$lib/stores"
    import { Toggle } from "$lib/widgets/layoutWidgets"

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

    $: uniqueHistory = graph.history._entries.filter(
        (element, index, array) => {
            const historyThingIds = array.map(visitedThing => visitedThing.thingId)
            const firstIndexOfId = historyThingIds.indexOf(element.thingId)
            return firstIndexOfId === index
        }
    )
    $: historyToUse = useUniqueHistory ? uniqueHistory : graph.history._entries

    $: historyWithThings = historyToUse.map(
        (entry) => {
            return {
                timestamp: entry.timestamp,
                thingId: entry.thingId,
                thing: graphDbModelInStore("Thing", entry.thingId) ? getGraphConstructs("Thing", entry.thingId) : null
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


<div class="history-viewer">
    <div class="title">
        <h4>History</h4>
    </div>

    <div class="unique-toggle {useUniqueHistory ? "toggled": ""}">
        Unique
        <Toggle
            bind:toggled={useUniqueHistory}
        />
    </div>

    <div class="content">
        {#each reverseHistoryWithDateDividers as entryOrDivider}

            {#if "thingId" in entryOrDivider}

                <div
                    class="box
                        { entryOrDivider.thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }
                        { entryOrDivider.thing ? "" : "id-not-found" }
                    "
                    on:mouseenter={()=>{ if (entryOrDivider && "thingId" in entryOrDivider) hoveredThingIdStore.set(entryOrDivider.thingId) }}
                    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
                    on:click={ () => { if (entryOrDivider && "thingId" in entryOrDivider && entryOrDivider.thing) rePerspectToThingId(entryOrDivider.thingId)}
                }>
                    { entryOrDivider.thing?.text || `(THING ${entryOrDivider.thingId} NOT FOUND IN STORE)` }
                </div>

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