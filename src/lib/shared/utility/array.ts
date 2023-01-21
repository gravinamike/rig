/**
 * Remove-item-from-array method.
 * 
 * Removes the first instance of a given item from a given array.
 * @param array - The array to remove the item from.
 * @param item - The item to remove from the array.
 */
export function removeItemFromArray<Type>( array: Type[], item: Type ): void {
    const index = array.indexOf(item)
    if (index !== -1) array.splice(index, 1)
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
export function changeIndexInArray<Type>(array: Type[], currentIndex: number, newIndex: number): Type[] | null {
    // If the destination index is invalid (outside the bounds of the array), return null.
    if ( newIndex < 0 || array.length <= newIndex ) return null
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