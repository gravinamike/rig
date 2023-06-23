import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/*
 * Create a Relationship between two targets (which may be Things or Relationship stems).
 */
export async function createNewRelationship(sourceThingId: number, destThingId: number, directionId: number): Promise<boolean> {
    // Post to the create-new Relationship API.
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
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/*
 * Update the Direction of a set of Relationships.
 */
export async function updateRelationships( relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number}[] ): Promise<boolean> {
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


/*
 * Delete a Thing.
 */
export async function deleteRelationship( sourceThingId: number, destThingId: number ): Promise<boolean> {
    // Post to the delete-Thing API.
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

export async function reorderRelationship(
    sourceThingId: number,
    destThingDirectionId: number,
    destThingId: number,
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