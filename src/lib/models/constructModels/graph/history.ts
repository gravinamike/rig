// Import types.
import type { HistoryEntry, DateDivider } from "./historyUtility"

// Import stores and utility functions.
import { getGraphConstructs, graphDbModelInStore } from "$lib/stores"
import { clampNumber } from "$lib/shared/utility"
import { getDatesBetweenTwoDates } from "./historyUtility"



/** Class representing the Perspective History of a Graph. */
export class PerspectiveHistory {
    // Whether to use the full or unique history.
    #useUniqueHistory = true
    
    // The full, unique, and to-be-used histories.
    #fullHistory: HistoryEntry[] = []
    #uniqueHistory: HistoryEntry[] = []
    #historyToUse: HistoryEntry[] = []


    reverseHistoryWithDateDividers: (HistoryEntry | DateDivider)[] = []

    // Position in the history.
    position = 0

    // Which Thing ID is currently selected.
    selectedThingId: number | null = null


    /**
     * Add-entries method.
     * 
     * Add one or multiple Thing IDs to the Perspective History.
     * @param  {number | number[]} thingIds - The Thing ID or IDs to add to the History.
     */
    async addEntries( thingIds: number | number[] ): Promise< void > {
        // Re-package single Thing IDs into an array for processing.
        if (typeof thingIds === "number") thingIds = [thingIds]
        
        // Construct and add entries to the history entries object.
        const timestamp = new Date()
        const entries: HistoryEntry[] = thingIds.map(
            (thingId) => { return {
                timestamp: timestamp,
                thingId: thingId,
                thing: 
                    graphDbModelInStore("Thing", thingId) ? getGraphConstructs("Thing", thingId) :
                    null
            } }
        )
        this.#fullHistory.push(...entries)
        
        // Rebuild the history (setting the position to the end).
        this.build(true)
    }

    /**
     * Build-unique-history method.
     * 
     * Derive unique history array from base history array.
     */
    buildUniqueHistory(): void {
        // Get a list of Thing IDs from the full history (excluding date
        // dividers).
        const historyThingIds = this.#fullHistory.map(
            visitedThing => "thingId" in visitedThing ? visitedThing.thingId : "divider"
        )

        // Derive unique history array from full history array, filtering for
        // only the last instance of each Thing ID.
        const uniqueHistory=
            this.#fullHistory.filter(
                (element, index) => {
                    const lastIndexOfId = historyThingIds.lastIndexOf(element.thingId)
                    return lastIndexOfId === index
                }
            )
        
        // Set unique-history-with-Things array to this array.
        this.#uniqueHistory = uniqueHistory
    }


    /**
     * Reverse-and-add-date-dividers method.
     * 
     * Create a version of history that is reversed and has date dividers
     * inserted between each day's history entries.
     * @param historyWithThings - The history array to be modified.
     * @returns A reversed version of the history array, with date dividers added.
     */
    reverseAndAddDateDividers(history: HistoryEntry[]): (HistoryEntry | DateDivider)[] {
        // Construct a list of date dividers for all dates in the history.
        const datesInHistory =
            history.length ? getDatesBetweenTwoDates(
                history[0].timestamp,
                history[history.length - 1].timestamp
            ) :
            []
        const dateDividers = datesInHistory.map((date) => {return {timestamp: date}})

        // Add the date divider list to the end of the history Thing list.
        const historyWithDateDividers =
            (history as (HistoryEntry | DateDivider)[]).concat(dateDividers)

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
    build(movePositionToEnd = false): void {
        // Build full, unique, and to-be-used histories.
        this.buildUniqueHistory()
        this.#historyToUse =
            this.#useUniqueHistory ? this.#uniqueHistory :
            this.#fullHistory

        // Build the reversed history with date dividers.
        this.reverseHistoryWithDateDividers = this.reverseAndAddDateDividers(this.#historyToUse)
        
        // Re-calculate position in history and the ID of the currently-
        // selected Thing.
        if (movePositionToEnd) this.position = this.#fullHistory.length - 1
        this.selectedThingId = this.entryAtPosition.thingId
    }

    /**
     * Set-unique method.
     * 
     * Sets the history to unique or full mode and rebuilds it.
     * @param unique - Whether to use the unique history.
     */
    setUnique(unique: boolean): void {
        this.#useUniqueHistory = unique
        this.build()
    }

    incrementPosition(delta: -1 | 1): void {
        // Save the current position.
        const oldPosition = this.position

        // Derive the new position.
        const newPosition = clampNumber(this.position + delta, 0, this.#fullHistory.length - 1)

        // If the position has changed, update position and selected Thing ID.
        if (newPosition !== oldPosition) {
            this.position = newPosition
            this.selectedThingId = this.entryAtPosition.thingId
        }
    }

    /**
     * Entry-at-position accessor.
     * 
     * Gives the history-entry-with-Thing object at the current position in the
     * history.
     */
    get entryAtPosition(): HistoryEntry {
        return this.#fullHistory[this.position]
    }
}