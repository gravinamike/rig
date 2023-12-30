import type { Direction } from "$lib/models/constructModels"
import { writable } from "svelte/store"



interface DirectionSelectionInfo {
    show: boolean
    directionWidget: Element | null,
    startingDirection: Direction | null
    askingForDirection: boolean
    optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void
    optionHoveredFunction: (optionId: number, option: Direction) => void
    exitOptionHoveredFunction: () => void
}


const nullDirectionSelectionInfo = {
    show: false,
    directionWidget: null,
    startingDirection: null,
    askingForDirection: false,
    optionClickedFunction: () => {},
    optionHoveredFunction: () => {},
    exitOptionHoveredFunction: () => {}
}



// Direction-selection info Store.
// Controls the Direction-selection dropdown menu.
export const directionSelectionInfoStore = writable(
    {
        show: false,
        directionWidget: null,
        startingDirection: null,
        askingForDirection: false,
        optionClickedFunction: () => {},
        optionHoveredFunction: () => {},
        exitOptionHoveredFunction: () => {}
    } as DirectionSelectionInfo
)


/**
 * Open a Direction-selection dropdown menu.
 * @param position - The screen coordinates at which to open the menu.
 */
export function openDirectionSelectionDropdownMenu(
    directionWidget: Element,
    startingDirection: Direction | null,
    askingForDirection: boolean,
    optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void = () => {},
    optionHoveredFunction: (optionId: number, option: Direction) => void = () => {},
    exitOptionHoveredFunction: () => void = () => {}
): void {
    const directionSelectionInfo = {
        show: true,
        directionWidget: directionWidget,
        startingDirection: startingDirection,
        askingForDirection: askingForDirection,
        optionClickedFunction: optionClickedFunction,
        optionHoveredFunction: optionHoveredFunction,
        exitOptionHoveredFunction: exitOptionHoveredFunction
    }
    directionSelectionInfoStore.update( () => directionSelectionInfo )
}





/**
 * Close the direction-selection dropdown menu.
 */
export function closeDirectionSelectionDropdownMenu(): void {
    directionSelectionInfoStore.update( () => nullDirectionSelectionInfo )
}