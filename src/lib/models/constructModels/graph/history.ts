// Type imports.
import type { Graph } from "$lib/models/constructModels"
import { clampNumber } from "$lib/shared/utility"
import { getGraphConstructs, graphDbModelInStore } from "$lib/stores"
import { getDatesBetweenTwoDates, type DateDivider, type HistoryEntryWithThing } from "./historyUtility"



/** Class representing the Perspective History of a Graph. */
export class PerspectiveHistory {
    _graph: Graph
    _entries: { timestamp: Date, thingId: number }[] = []
    _useUniqueHistory = true
    fullHistoryWithThings: HistoryEntryWithThing[] = []
    uniqueHistoryWithThings: HistoryEntryWithThing[] = []
    historyWithThings: HistoryEntryWithThing[] = []
    reverseHistoryWithDateDividers: (HistoryEntryWithThing | DateDivider)[] = []

    fullPosition = 0
    uniquePosition = 0
    position = 0
    selectedThingId: number | null = null

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

        this.build()

        this.fullPosition = this.fullHistoryWithThings.length - 1
        this.uniquePosition = this.uniqueHistoryWithThings.length - 1
        this.position = this._useUniqueHistory ? this.uniquePosition : this.fullPosition
        this.selectedThingId = this.entryWithThingAtPosition.thingId
    }

    buildFullHistoryWithThings(): void {
        const fullHistoryWithThings: HistoryEntryWithThing[] = this._entries.map(
            (entry) => {
                return {
                    timestamp: entry.timestamp,
                    thingId: entry.thingId,
                    thing: graphDbModelInStore("Thing", entry.thingId) ? getGraphConstructs("Thing", entry.thingId) : null
                }
            }
        )
        
        this.fullHistoryWithThings = fullHistoryWithThings
    }

    buildUniqueHistoryWithThings(): void {
        const uniqueHistoryWithThings = 
            this.fullHistoryWithThings.filter(
                (element, index, array) => {

                    if ("thingId" in element) {
                        const historyThingIds = array.map(
                            visitedThing => "thingId" in visitedThing ? visitedThing.thingId : "divider"
                        )
                        const lastIndexOfId = historyThingIds.lastIndexOf(element.thingId)
                        return lastIndexOfId === index
                    } else {
                        return true
                    }
                    
                }
            )
        
        this.uniqueHistoryWithThings = uniqueHistoryWithThings
    }



    reverseAndAddDateDividers(historyWithThings: HistoryEntryWithThing[]): (HistoryEntryWithThing | DateDivider)[] {
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

        return reverseHistoryWithDateDividers
    }


    build(): void {
        this.buildFullHistoryWithThings()
        this.buildUniqueHistoryWithThings()
        this.historyWithThings =
            this._useUniqueHistory ? this.uniqueHistoryWithThings :
            this.fullHistoryWithThings
        this.reverseHistoryWithDateDividers = this.reverseAndAddDateDividers(this.historyWithThings)

        this.position = this._useUniqueHistory ? this.uniquePosition : this.fullPosition
        this.selectedThingId = this.entryWithThingAtPosition.thingId
    }


    setUnique(unique: boolean): void {
        this._useUniqueHistory = unique
        this.build()
    }


    incrementFullPosition(delta: -1 | 1): void {
        const oldFullPosition = this.fullPosition
        const newFullPosition = clampNumber(this.fullPosition + delta, 0, this.fullHistoryWithThings.length - 1)

        if (newFullPosition !== oldFullPosition) {
            this.fullPosition = newFullPosition
            this.position = this.fullPosition
            this.uniquePosition = this.uniqueHistoryWithThings.length - 1
            this.selectedThingId = this.entryWithThingAtPosition.thingId
        }
    }

    incrementUniquePosition(delta: -1 | 1): void {
        const oldUniquePosition = this.uniquePosition
        const newUniquePosition = clampNumber(this.uniquePosition + delta, 0, this.uniqueHistoryWithThings.length - 1)

        if (newUniquePosition !== oldUniquePosition) {
            this.uniquePosition = newUniquePosition
            this.position = this.uniquePosition
            this.fullPosition = this.fullHistoryWithThings.length - 1
            this.selectedThingId = this.entryWithThingAtPosition.thingId
        }
    }

    incrementPosition(delta: -1 | 1): void {     
        if (this._useUniqueHistory) {
            this.incrementUniquePosition(delta)
        } else {
            this.incrementFullPosition(delta)
        }
    }

    get entryWithThingAtPosition(): HistoryEntryWithThing {
        if (this._useUniqueHistory) {
            return this.uniqueHistoryWithThings[this.position]
        } else {
            return this.fullHistoryWithThings[this.position]
        }
    }
}