// Import types.
import type { RawSpaceDbModel } from "$lib/models/dbModels/serverSide"

// Import database-framework-related classes.
import { querySpaces } from "../getInfo"

// Import constants and utility methods.
import { oddHalfAxisIds } from "$lib/shared/constants"
import { arrayHasDuplicates } from "$lib/shared/utility"


/**
 * Graph-needs-repair method.
 * 
 * Indicates whether the Graph needs repair for issues like multiple Directions
 * being assigned to the same half-axis for a given Direction.
 * @returns - Whether or not the Graph needs repair.
 */
export async function graphNeedsRepair(): Promise<boolean> {

    let graphNeedsRepair = false

    // Retrieve Space records.
    const queriedSpaces = await querySpaces(null)

    // For each Space,
    for (const space of queriedSpaces) {
        if (spaceNeedsRepair(space)) {
            graphNeedsRepair = true
            console.log(`Space ${space.id} has multiple Directions assigned to the same half-axis and needs repair.`)
        }
    }

    return graphNeedsRepair

}

/**
 * Repair-Graph function.
 * 
 * Repairs a Graph for issues like multiple Directions being assigned to the
 * same half-axis ID in a given Space.
 */
export async function repairGraph(): Promise<void> {
    console.log("Repairing Graph file.")

    // Retrieve Space records.
    const queriedSpaces = await querySpaces(null)

    // For each Space that needs repair,
    for (const space of queriedSpaces) if (spaceNeedsRepair(space)) {
        // For each Direction in the Space,
        for (const [i, direction] of space.directions.entries()) {

            // For the first 4 indices (corresponding to the odd half-axes),
            if (i <= 3) {
                // Set the half-axis IDs in order [1, 3, 5, 7.].
                const newHalfAxisId = oddHalfAxisIds[i]
                await space.$relatedQuery('directions')
                    .patch({
                        halfaxisid: newHalfAxisId
                    })
                    .where('directions.id', direction.id)

            // For indices greater than 4 (meaning any Directions erroneously
            // linked outside of the half-axes.)
            } else {
                // Unlink from the Space.
                await space.$relatedQuery('directions').where('id', direction.id)

            }
        }
    }

}

/**
 * Space-needs-repair method.
 * 
 * Indicates whether a Space needs repair for issues like multiple Directions
 * being assigned to the same half-axis ID in a given Space.
 * @param space - The Space to check.
 * @returns - Whether the Space need repair.
 */
function spaceNeedsRepair(space: RawSpaceDbModel) {
    // Get the half-axis IDs associated with its Directions.
    const directionIdHalfAxisIds = space.directions.map(direction => direction.halfaxisid)
    // If there are duplicate IDs, the Graph needs repair.
    return arrayHasDuplicates(directionIdHalfAxisIds) ? true : false
}