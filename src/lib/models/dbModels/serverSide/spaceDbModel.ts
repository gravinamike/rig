import type { RelationMappings, RelationMappingsThunk } from "objection"
import type { DirectionToSpaceDbModel, SpaceDbModel } from "../clientSide"

import { Model } from "objection"
import { RawDirectionDbModel } from "$lib/models/dbModels/serverSide"
import { stripDirectionDbModels } from "./directionDbModel"



/*
 * Space model.
 */
export class RawSpaceDbModel extends Model {
    static tableName = "spaces" as const

    id!: string | number | null
    text!: string | null
    directions!: RawDirectionDbModel[]


    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            directions: {
                relation: Model.ManyToManyRelation,
                modelClass: RawDirectionDbModel,
                join: {
                    from: 'spaces.id',
                    through: {
                        from: 'directiontospace.spaceid',
                        to: 'directiontospace.directionid'
                    },
                    to: 'directions.id'
                }
            }
        }
    }
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripSpaceDbModels(models: RawSpaceDbModel[]): SpaceDbModel[] {
    const stripped = []
    
    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                text: model.text,
                directions: model.directions ? stripDirectionDbModels(model.directions) : []
            }
        )
    }

    return stripped
}



/*
 * DirectionToSpace model.
 */
export class RawDirectionToSpaceDbModel extends Model {
    static tableName = "directiontospace" as const

    id!: string | number | null
    directionid!: string | number | null
    spaceid!: string | number | null
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripDirectionToSpaceDbModels(models: RawDirectionToSpaceDbModel[]): DirectionToSpaceDbModel[] {
    const stripped = []
    
    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                directionid: model.directionid,
                spaceid: model.spaceid
            }
        )
    }

    return stripped
}