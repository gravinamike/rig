// Import types.
import type { Direction } from "$lib/models/constructModels"

// Import stores.
import { writable } from "svelte/store"


/**
 * Direction-selection-info interface.
 * 
 * Defines the information needed for a select-direction operation (or lack of one).
 */
interface DirectionSelectionInfo {
    show: boolean
    directionWidget: Element | null,
    startingDirection: Direction | null
    askingForDirection: boolean
    optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void
    optionHoveredFunction: (optionId: number, option: Direction) => void
    exitOptionHoveredFunction: () => void
}


/**
 * Null Direction-selection-info.
 * 
 * Defines the null state of the Direction-selection information (when no such operation is taking
 * place).
 */
const nullDirectionSelectionInfo = {
    show: false,
    directionWidget: null,
    startingDirection: null,
    askingForDirection: false,
    optionClickedFunction: () => {},
    optionHoveredFunction: () => {},
    exitOptionHoveredFunction: () => {}
}



/**
 * Direction-selection info Store.
 * 
 * Controls the state of the Direction-selection dropdown menu.
 */
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
 * Open Direction-selection-dropdown-menu method.
 * 
 * Opens a Direction-selection dropdown menu.
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
 * Close Direction-selection-dropdown-menu method.
 * 
 * Close the Direction-selection dropdown menu.
 */
export function closeDirectionSelectionDropdownMenu(): void {
    directionSelectionInfoStore.update( () => nullDirectionSelectionInfo )
}