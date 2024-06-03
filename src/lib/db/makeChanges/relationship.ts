// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/**
 * Create-new-Relationship method.
 * 
 * Creates a Relationship between two Things.
 * @param sourceThingId - The ID of the first Thing.
 * @param destThingId - The ID of the second Thing.
 * @param directionId - The ID of the Direction of the Relationship between the first and second Thing.
 * @returns - A boolean indicating whether or not the create-Relationship operation was successful.
 */
export async function createNewRelationship(
    sourceThingId: number,
    destThingId: number,
    directionId: number
): Promise<boolean> {
    // Post to the create-new-Relationship API.
    const res = await fetch(
        `api/db/graphManipulation/createNewRelationship`,
        {
            method: "POST",

            body: JSON.stringify({
                sourceThingId: sourceThingId,
                destThingId: destThingId,
                directionId: directionId
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else if (res.status === 429) {
        return false
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Update-Relationships method.
 * 
 * Changes a Relationship as identified by its source and destination Thing
 * IDs. Attributes that can be changed currently include the Direction.
 * @param relationshipInfos - A list of objects representing Relationships, containing the source and destination Thing IDs, and the values of attributes to change (like Direction).
 * @returns - A boolean indicating whether or not the update-Relationship operation was successful.
 */
export async function updateRelationships(
    relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number}[]
): Promise<boolean> {
    // Post to the update-Relationships API.
    const res = await fetch(
        `api/db/graphManipulation/updateRelationships`,
        {
            method: "POST",
            body: JSON.stringify({
                relationshipInfos: relationshipInfos
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
 * Reorder-Relationship method.
 * 
 * Reorders a Relationship, as identified by its source and destination Thing
 * IDs, relative to the other Relationships in its Relationship cohort.
 * @param sourceThingId - The ID of the Relationship's source Thing.
 * @param destThingId - The ID of the Relationship's destination Thing.
 * @param destThingDirectionId - The ID of the Direction that the destination Thing is in relative to the source Thing.
 * @param newIndex - The new Relationship order index.
 * @returns  - A boolean indicating whether or not the reorder-Relationship operation was successful.
 */
export async function reorderRelationship(
    sourceThingId: number,
    destThingId: number,
    destThingDirectionId: number,
    newIndex: number
): Promise< boolean > {
    // Post to the reorder-Relationship API.
    const res = await fetch(
        `api/db/graphManipulation/reorderRelationship`,
        {
            method: "POST",
            body: JSON.stringify({
                sourceThingId: sourceThingId,
                destThingDirectionId: destThingDirectionId,
                destThingId: destThingId,
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
 * Delete-Relationship method.
 * 
 * Deletes a Relationship as identified by its source and destination Thing
 * IDs.
 * @param sourceThingId - The ID of the Relationship's source Thing.
 * @param destThingId - The ID of the Relationship's destination Thing.
 * @returns - A boolean indicating whether or not the delete-Relationship operation was successful.
 */
export async function deleteRelationship( sourceThingId: number, destThingId: number ): Promise<boolean> {
    // Post to the delete-Relationship API.
    const res = await fetch(
        `api/db/graphManipulation/deleteRelationship`,
        {
            method: "POST",
            body: JSON.stringify({
                sourceThingId: sourceThingId,
                destThingId: destThingId
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