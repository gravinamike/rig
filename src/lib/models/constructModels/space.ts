import type { GraphConstruct, HalfAxisId, OddHalfAxisId } from "$lib/shared/constants"
import type { SpaceDbModel } from "$lib/models/dbModels"
import { Direction } from "$lib/models/constructModels"

import { oddHalfAxisIds, halfAxisOppositeIds } from "$lib/shared/constants"
import { getGraphConstructs } from "$lib/stores"



/*
 * Space model.
 */
export class Space {
    dbModel: SpaceDbModel | null

    id: number | null
    text: string | null
    directions: Direction[] = []

    constructor(dbModel: SpaceDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.text = dbModel.text

        for (const directionDbModel of dbModel.directions) {
            this.directions.push( new Direction(directionDbModel) )
        }
    }


    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        const directionIdsByHalfAxisId: { [halfAxisId: number]: number | null } = {}
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const evenHalfAxisId = oddHalfAxisId + 1

            const directionIndex = (oddHalfAxisId - 1) / 2
            if (directionIndex < this.directions.length) {
                const direction = this.directions[directionIndex]
                directionIdsByHalfAxisId[oddHalfAxisId] = direction.id
                directionIdsByHalfAxisId[evenHalfAxisId] = direction.oppositeid
            }
        }
        return directionIdsByHalfAxisId
    }

    get directionByHalfAxisId(): { [halfAxisId: number]: Direction | null } {
        const directionByHalfAxisId: { [halfAxisId: number]: Direction | null } = {}
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const directionIndex = (oddHalfAxisId - 1) / 2
            if (directionIndex < this.directions.length) {
                const direction = this.directions[directionIndex]
                const oppositeDirection = direction.oppositeid ?
                    getGraphConstructs("Direction", direction.oppositeid) as Direction | null :
                    null
                directionByHalfAxisId[oddHalfAxisId] = direction
                directionByHalfAxisId[oddHalfAxisId + 1] = oppositeDirection
            }
        }
        return directionByHalfAxisId
    }

    get halfAxisIdByDirectionId(): { [directionId: number]: HalfAxisId } {
        const halfAxisIdByDirectionId: { [directionId: number]: HalfAxisId } = {}
        const halfAxisIds = Object.keys(this.directionIdByHalfAxisId).map(k => Number(k) as HalfAxisId)
        for (const halfAxisId of halfAxisIds) {
            const directionId = this.directionIdByHalfAxisId[halfAxisId]
            if (directionId) halfAxisIdByDirectionId[directionId] = halfAxisId
        }
        return halfAxisIdByDirectionId
    }
}

/*
 * Typeguard functions for Graph construct classes.
 */
export function isSpace(construct: GraphConstruct): construct is Space {
    return "directions" in construct
}


export function copiedSpace(startingSpace: Space): Space {
    const copiedSpace = Object.assign(Object.create(Object.getPrototypeOf(startingSpace)), startingSpace) as Space
    copiedSpace.dbModel = null
    copiedSpace.id = null
    copiedSpace.text = null
    copiedSpace.directions = []
    for (const direction of startingSpace.directions) copiedSpace.directions.push(direction)

    return copiedSpace
}

export function alteredSpace(
    startingSpace: Space, direction: Direction, halfAxisId: HalfAxisId
): Space | null {
    const alteredSpace = copiedSpace(startingSpace)
    
    const indexInSpace = oddHalfAxisIds.indexOf(halfAxisId as OddHalfAxisId)
    const oppositeHalfAxisId = halfAxisOppositeIds[halfAxisId]
    const indexOfOppositeInSpace = oddHalfAxisIds.indexOf(oppositeHalfAxisId as OddHalfAxisId)
    
    const oppositeDirection = direction.oppositeid ?
        getGraphConstructs("Direction", direction.oppositeid) as Direction | null :
        null

    if (
        !(
            indexInSpace !== -1
            || indexOfOppositeInSpace !== -1
        )
        || !oppositeDirection
    ) return null

    // If the Half Axis ID is odd,
    if (indexInSpace !== -1) {
        alteredSpace.directions.splice(indexInSpace, 1, direction)
    // Otherwise, if the Half Axis ID is even,
    } else {
        alteredSpace.directions.splice(indexOfOppositeInSpace, 1, oppositeDirection)
    }

    return alteredSpace
}