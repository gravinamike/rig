import type { Direction } from "$lib/models/constructModels"
import type { OddHalfAxisId } from "$lib/shared/constants"
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/*
 * Create a new Direction.
 */
export async function createDirection(
    directionText: string,
    objectText: string,
    oppositeDirectionId: number | null
): Promise<number | false> {
    // Post to the create-Space API.
    const res = await fetch(
        `api/db/graphManipulation/createDirection`,
        {
            method: "POST",

            body: JSON.stringify({
                directionText: directionText,
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

/*
 * Update an existing Direction.
 */
export async function updateDirection(
    directionId: number,
    directionText: string,
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
                directionText: directionText,
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

/*
 * Delete a Direction.
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


/*
 * Create a new Space.
 */
export async function createSpace(
    spaceText: string,
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<number | false> {
    // Post to the create-Space API.
    const res = await fetch(
        `api/db/graphManipulation/createSpace`,
        {
            method: "POST",

            body: JSON.stringify({
                spaceText: spaceText,
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


/*
 * Update an existing Space.
 */
export async function updateSpace(
    spaceId: number,
    spaceText: string,
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


/*
 * Delete a Space.
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