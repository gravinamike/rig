/**
 * Remove-item-from-array method.
 * 
 * Removes the a given item from a given array.
 * @param array - The array to remove the item from.
 * @param item - The item to remove from the array.
 * @param onlyFirstInstance - Whether to only remove the first instance, or all instances.
 */
export function removeItemFromArray<Type>( array: Type[], item: Type, onlyFirstInstance=true ): void {
    while (array.includes(item)) {
        const index = array.indexOf(item)
        if (index !== -1) array.splice(index, 1)
        if (onlyFirstInstance) break
    }
}

/**
 * Change-index-in-array method.
 * 
 * Moves the item at a given index in an array to a new given index.
 * @param array - The array to be rearranged.
 * @param currentIndex - The index of the item to be moved.
 * @param newIndex - The destination index to move the item to.
 * @returns - The rearranged array (or null if the destination index is invalid.)
 */
export function changeIndexInArray<Type>(array: Type[], currentIndex: number, newIndex: number): Type[] {
    // If the destination index is invalid (outside the bounds of the array), return null.
    if ( newIndex < 0 || array.length <= newIndex ) {
        throw Error("Tried to change position in array to nonexistent index.")
    }
    const newArray = [...array]

    // Move the specified item to the destination index.
    const extractedElement = newArray.splice(currentIndex, 1)[0]
    newArray.splice(newIndex, 0, extractedElement)

    // Return the rearranged array.
    return newArray
}

/**
 * Make-array-unique method.
 * 
 * Creates a version of the input array that contains only contain unique
 * items.
 * @param array - The source array of (potentially) non-unique values.
 * @returns - The derived array containing only unique values.
 */
export function makeArrayUnique<Type>(array: Type[]): Type[] {
    return [...new Set(array)]
}

/**
 * Array-has-duplicates method.
 * 
 * Determines if there are any duplicate values in the array.
 * @param array 
 * @returns 
 */
export function arrayHasDuplicates(array: unknown[]) {
    return (new Set(array)).size !== array.length
}

/**
 * Read-only array to array method.
 * 
 * Returns a basic, mutable array equivalent to the input read-only array.
 * @param readOnlyArray - A read-only array.
 * @returns - The equivalent mutable array.
 */
export function readOnlyArrayToArray(readOnlyArray: readonly number[]) {
    return readOnlyArray.concat() as number[]
}