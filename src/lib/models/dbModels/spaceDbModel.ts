import type { GraphConstruct, HalfAxisId } from "$lib/shared/constants"

import { oddHalfAxisIds } from "$lib/shared/constants"
import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { DirectionDbModel } from "$lib/models/dbModels"



/*
 * Space model.
 */
export class SpaceDbModel extends Model {
    static tableName = "spaces" as const

    id!: number
    text!: string | null
    directions!: DirectionDbModel[]


    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            directions: {
                relation: Model.ManyToManyRelation,
                modelClass: DirectionDbModel,
                join: {
                    from: 'spaces.id',
                    through: {
                        from: 'directiontospace.spaceid',
                        to: 'directiontospace.directionid'
                    },
                    to: 'directions.id'
                }
            }
        };
    }

    static get virtualAttributes(): string[] {
        return ['directionIdByHalfAxisId', 'halfAxisIdByDirectionId']
    }

    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        const directionIdsByHalfAxisIds: { [halfAxisId: number]: number | null } = {}
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const directionIndex = (oddHalfAxisId - 1) / 2
            if (directionIndex < this.directions.length) {
                const direction = this.directions[directionIndex]
                directionIdsByHalfAxisIds[oddHalfAxisId] = direction.id
                directionIdsByHalfAxisIds[oddHalfAxisId + 1] = direction.oppositeid
            }
        }
        return directionIdsByHalfAxisIds
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
export function isSpace(construct: GraphConstruct): construct is SpaceDbModel {
    return "directions" in construct
}