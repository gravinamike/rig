// Type imports.
import type { Graph } from "$lib/models/constructModels"
import { getGraphConstructs, graphDbModelInStore } from "$lib/stores"
import { getDatesBetweenTwoDates, type DateDivider, type HistoryEntryWithThing } from "./historyUtility"



/** Class representing the Perspective History of a Graph. */
export class PerspectiveHistory {
    _graph: Graph
    _entries: { timestamp: Date, thingId: number }[] = []
    historyWithThings: (HistoryEntryWithThing | DateDivider)[] = []
    uniqueHistoryWithThings: (HistoryEntryWithThing | DateDivider)[] = []

    /**
     * Create the Perspective History of the Graph.
     * @param {Graph} graph - The Graph the History belongs to.
     */
    constructor(graph: Graph) {
        this._graph = graph
    }

    /**
     * Add one or multiple Thing IDs to the Perspective History.
     * @param  {number | number[]} thingIds - The Thing ID or IDs to add to the History.
     */
    addEntries( thingIds: number | number[] ): void {
        if (typeof thingIds === "number") thingIds = [thingIds]
        const timestamp = new Date()
        const entries = thingIds.map(
            (thingId) => { return { timestamp: timestamp, thingId: thingId } }
        )
        this._entries.push(...entries)
        this.buildHistoryWithThings()
        this.buildUniqueHistoryWithThings()
    }

    buildHistoryWithThings(): void {
        // Construct the history Thing list.
        const historyWithThings = this._entries.map(
            (entry) => {
                return {
                    timestamp: entry.timestamp,
                    thingId: entry.thingId,
                    thing: graphDbModelInStore("Thing", entry.thingId) ? getGraphConstructs("Thing", entry.thingId) : null
                }
            }
        )

        // Construct a list of date dividers for all dates in the history.
        const datesInHistory =
            historyWithThings.length ? getDatesBetweenTwoDates(
                historyWithThings[0].timestamp,
                historyWithThings[historyWithThings.length - 1].timestamp
            ) :
            []
        const dateDividers = datesInHistory.map((date) => {return {timestamp: date}})

        // Add the date divider list to the end of the history Thing list.
        const historyWithDateDividers =
            (historyWithThings as (HistoryEntryWithThing | DateDivider)[]).concat(dateDividers)
        
        // Sort the history Thing/date divider list in reverse order.
        const reverseHistoryWithDateDividers =
            historyWithDateDividers.sort(
                (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            )
        
        this.historyWithThings = reverseHistoryWithDateDividers
    }

    buildUniqueHistoryWithThings(): void {
        const uniqueHistoryWithThings = 
            this.historyWithThings.filter(
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
        
        this.uniqueHistoryWithThings = uniqueHistoryWithThings
    }

    historyForViewer(useUniqueHistory: boolean): (HistoryEntryWithThing | DateDivider)[] {
        const historyToUse =
            useUniqueHistory ? this.uniqueHistoryWithThings :
            this.historyWithThings

        return historyToUse
    }
}