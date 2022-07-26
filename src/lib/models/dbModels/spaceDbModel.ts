import type { RelationMappings, RelationMappingsThunk } from "objection"

import { Model } from "objection"
import { DirectionDbModel } from "$lib/models/dbModels"



/*
 * Space model.
 */
export class SpaceDbModel extends Model {
    static tableName = "spaces" as const

    id!: string | number | null
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
}