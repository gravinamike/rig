// Import types.
import type { OddHalfAxisId } from "$lib/shared/constants"
import type { Direction } from "$lib/models/constructModels"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/**
 * Create-new-Direction method.
 * 
 * Creates a new Direction in the database.
 * @param relationshipText - The text that describes the Relationship.//////////////// directionText ---> relationshipText
 * @param objectText - The text that describes the object of the Relationship.
 * @param oppositeDirectionId - The ID of the opposite Direction (if any), or null.
 * @returns - A boolean indicating whether the create-Direction operation was successful.
 */
export async function createDirection(
    relationshipText: string,
    objectText: string,
    oppositeDirectionId: number | null
): Promise<number | false> {
    // Post to the create-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/createDirection`,
        {
            method: "POST",

            body: JSON.stringify({
                relationshipText: relationshipText,
                objectText: objectText,
                oppositeDirectionId: oppositeDirectionId
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        const newSpace = Number(await res.json() as string)
        return newSpace
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Update-Direction method.
 * 
 * Updates a Direction's attributes, including its relationship and object
 * texts and the ID of its opposite Direction.
 * @param directionId - The ID of the Direction to update.
 * @param relationshipText - The text that describes the Relationship.
 * @param nameForObjects - The text that describes the object of the Relationship.
 * @param oppositeId - The ID of the opposite Direction (if any), or null.
 * @returns - A boolean indicating whether the update-Direction operation was successful.
 */
export async function updateDirection(
    directionId: number,
    relationshipText: string,
    nameForObjects: string,
    oppositeId: number | null
): Promise<boolean> {
    // Post to the update-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/updateDirection`,
        {
            method: "POST",

            body: JSON.stringify({
                directionId: directionId,
                relationshipText: relationshipText,
                nameForObjects: nameForObjects,
                oppositeId: oppositeId
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Reorder-Direction method.
 * 
 * Changes the Direction's position within the order of Directions lists.
 * @param directionId - The index of the Direction to reorder.
 * @param newIndex - The new order index for the Direction.
 * @returns - Boolean indicating whether the reorder-Direction operation was successful.
 */
export async function reorderDirection(
    directionId: number,
    newIndex: number
): Promise< boolean > {
    // Post to the reorder-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/reorderDirection`,
        {
            method: "POST",
            body: JSON.stringify({
                directionId: directionId,
                newIndex: newIndex
            })
        }
    )
    
    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Delete-Direction method.
 * 
 * Deletes a Direction based on its ID.
 * @param directionIdToDelete - The ID of the Direction to delete.
 * @returns - Boolean indicating whether the delete-Direction operation was successful.
 */
export async function deleteDirection( directionIdToDelete: number ): Promise<boolean> {
    // Post to the delete-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/deleteDirection`,
        {
            method: "POST",
            body: JSON.stringify({
                spaceIdToDelete: directionIdToDelete
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/**
 * Create-Space method.
 * 
 * Creates a new Space in the database.
 * @param spaceText - The text (or "name") of the new Space.
 * @param spaceBuildMethod - The build method to use for Graphs in this Space.
 * @param halfAxisIdsAndDirections - An object mapping the Space's Directions to half-axes by ID.
 * @returns - A boolean indicating whether the create-Space method was successful.
 */
export async function createSpace(
    spaceText: string,
    spaceBuildMethod: "radial" | "grid",
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<number | false> {
    // Post to the create-Space API.
    const res = await fetch(
        `api/db/graphManipulation/createSpace`,
        {
            method: "POST",

            body: JSON.stringify({
                spaceText: spaceText,
                spaceBuildMethod: spaceBuildMethod,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        const newSpace = Number(await res.json() as string)
        return newSpace
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Update-Space method.
 * 
 * Updates an existing Space, changing attributes like text and the mapping of
 * Directions to half-axes.
 * @param spaceId - The ID of the Space to edit.
 * @param spaceText - The text (or "name") of the new Space.
 * @param halfAxisIdsAndDirections - An object mapping the Space's Directions to half-axes by ID.
 * @returns - A boolean indicating whether the update-Space method was successful.
 */
export async function updateSpace(
    spaceId: number,
    spaceText: string,
    spaceBuildMethod: "radial" | "grid",
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<boolean> {
    // Post to the update-Space API.
    const res = await fetch(
        `api/db/graphManipulation/updateSpace`,
        {
            method: "POST",

            body: JSON.stringify({
                spaceId: spaceId,
                spaceText: spaceText,
                spaceBuildMethod: spaceBuildMethod,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/**
 * Reorder-Space method.
 * 
 * Changes the Space's position within the order of Space lists.
 * @param spaceId - The ID of the Space to reorder.
 * @param newIndex - The new order index for the Space.
 * @returns - A boolean indicating whether the reorder-Space method was successful.
 */
export async function reorderSpace(
    spaceId: number,
    newIndex: number
): Promise< boolean > {
    // Post to the reorder-Space API.
    const res = await fetch(
        `api/db/graphManipulation/reorderSpace`,
        {
            method: "POST",
            body: JSON.stringify({
                spaceId: spaceId,
                newIndex: newIndex
            })
        }
    )
    
    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Delete-Space method.
 * 
 * Deletes a Space based on its ID.
 * @param spaceIdToDelete - The ID of the Space to delete.
 * @returns - A boolean indicating whether the delete-Space method was successful.
 */
export async function deleteSpace( spaceIdToDelete: number ): Promise<boolean> {
    // Post to the delete-Space API.
    const res = await fetch(
        `api/db/graphManipulation/deleteSpace`,
        {
            method: "POST",
            body: JSON.stringify({
                spaceIdToDelete: spaceIdToDelete
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}