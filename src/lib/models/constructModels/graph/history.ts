// Import types.
import type { Graph } from "$lib/models/constructModels"
import type { HistoryEntryWithThing, DateDivider } from "./historyUtility"

// Import stores and utility functions.
import { getGraphConstructs, graphDbModelInStore } from "$lib/stores"
import { clampNumber } from "$lib/shared/utility"
import { getDatesBetweenTwoDates } from "./historyUtility"



/** Class representing the Perspective History of a Graph. */
export class PerspectiveHistory {
    // The Graph the History belongs to.
    _graph: Graph

    // Whether to use the raw or unique history.
    _useUniqueHistory = true

    // Basic array of Thing IDs by timestamp.
    _entries: { timestamp: Date, thingId: number }[] = []

    // History arrays for use by the History Viewer.
    fullHistoryWithThings: HistoryEntryWithThing[] = []
    uniqueHistoryWithThings: HistoryEntryWithThing[] = []
    historyWithThings: HistoryEntryWithThing[] = []
    reverseHistoryWithDateDividers: (HistoryEntryWithThing | DateDivider)[] = []

    // Position in the history.
    position = 0

    // Which Thing ID is currently selected.
    selectedThingId: number | null = null


    /**
     * Create the Perspective History of the Graph.
     * @param {Graph} graph - The Graph the History belongs to.
     */
    constructor(graph: Graph) {
        this._graph = graph
    }


    /**
     * Add-entries method.
     * 
     * Add one or multiple Thing IDs to the Perspective History.
     * @param  {number | number[]} thingIds - The Thing ID or IDs to add to the History.
     */
    addEntries( thingIds: number | number[] ): void {
        // Re-package single Thing IDs into an array for processing.
        if (typeof thingIds === "number") thingIds = [thingIds]

        // Construct and add entries to the history entries object.
        const timestamp = new Date()
        const entries = thingIds.map(
            (thingId) => { return { timestamp: timestamp, thingId: thingId } }
        )
        this._entries.push(...entries)

        // Rebuild the Graph.
        this.build()

        // Re-calculate position in history and selected Thing ID.
        this.position = this.fullHistoryWithThings.length - 1
        this.selectedThingId = this.entryWithThingAtPosition.thingId
    }

    /**
     * Build-full-history-with-Things method.
     * 
     * Derive history with things array from base history entries.
     */
    buildFullHistoryWithThings(): void {
        // Derive history with things array from base history entries.
        const fullHistoryWithThings: HistoryEntryWithThing[] = this._entries.map(
            (entry) => {
                return {
                    timestamp: entry.timestamp,
                    thingId: entry.thingId,
                    thing: graphDbModelInStore("Thing", entry.thingId) ? getGraphConstructs("Thing", entry.thingId) : null
                }
            }
        )
        
        // Set full-history-with-Things array to this array.
        this.fullHistoryWithThings = fullHistoryWithThings
    }

    /**
     * Build-unique-history-with-Things method.
     * 
     * Derive unique history with things array from base history entries.
     */
    buildUniqueHistoryWithThings(): void {
        
        // Get a list of Thing Ids from the full history (excluding date
        // dividers).
        const historyThingIds = this.fullHistoryWithThings.map(
            visitedThing => "thingId" in visitedThing ? visitedThing.thingId : "divider"
        )

        // Derive unique history with things array from full history with things
        // array, filtering for only the last instance of each Thing ID.
        const uniqueHistoryWithThings = 
            this.fullHistoryWithThings.filter(
                (element, index) => {
                    const lastIndexOfId = historyThingIds.lastIndexOf(element.thingId)
                    return lastIndexOfId === index
                }
            )
        
        // Set unique-history-with-Things array to this array.
        this.uniqueHistoryWithThings = uniqueHistoryWithThings
    }


    /**
     * Reverse-and-add-date-dividers method.
     * 
     * Create a version of history with things that is reversed and has date
     * dividers inserted between each day's history entries.
     * @param historyWithThings - The history-with-things array to be modified.
     * @returns A reversed version of the history-with-things array, with date dividers added.x
     */
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


    /**
     * Build-histories method.
     * 
     * Builds all versions of the history and derives the position and the ID of
     * the selected Thing.
     */
    build(): void {
        // Build full, unique, and to-be-used histories, as well as the reversed
        // history with date dividers.
        this.buildFullHistoryWithThings()
        this.buildUniqueHistoryWithThings()
        this.historyWithThings =
            this._useUniqueHistory ? this.uniqueHistoryWithThings :
            this.fullHistoryWithThings
        this.reverseHistoryWithDateDividers = this.reverseAndAddDateDividers(this.historyWithThings)

        // Derive the ID of the currently selected Thing.
        this.selectedThingId = this.entryWithThingAtPosition.thingId
    }

    /**
     * Set-unique method.
     * 
     * Sets the history to unique or full mode and rebuilds it.
     * @param unique - Whether to use the unique history.
     */
    setUnique(unique: boolean): void {
        this._useUniqueHistory = unique
        this.build()
    }

    incrementPosition(delta: -1 | 1): void {
        // Save the current position.
        const oldPosition = this.position

        // Derive the new position.
        const newPosition = clampNumber(this.position + delta, 0, this.fullHistoryWithThings.length - 1)

        // If the position has changed, update position and selected Thing ID.
        if (newPosition !== oldPosition) {
            this.position = newPosition
            this.selectedThingId = this.entryWithThingAtPosition.thingId
        }
    }

    /**
     * Entry-with-Thing-at-position accessor.
     * 
     * Gives the history-entry-with-Thing object at the current position in the
     * history.
     */
    get entryWithThingAtPosition(): HistoryEntryWithThing {
        return this.fullHistoryWithThings[this.position]
    }
}