import type { RelationMappings, RelationMappingsThunk } from "objection"
import type { DirectionToSpaceDbModel, SpaceDbModel } from "$lib/models/dbModels"

import { Model } from "objection"
import { RawDirectionDbModel } from "$lib/server/models"
import { stripDirectionDbModels } from "./directionDbModel"



/*
 * Space model.
 */
export class RawSpaceDbModel extends Model {
    static tableName = "spaces" as const

    id!: string | number | null
    text!: string | null
    spaceorder!: number | null
    buildmethod!: string | null
    directions!: RawDirectionDbModel[]

    directionToSpaces!: RawDirectionToSpaceDbModel[]


    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            directions: {
                relation: Model.ManyToManyRelation,
                modelClass: RawDirectionDbModel,
                join: {
                    from: 'spaces.id',
                    through: {
                        from: 'directiontospace.spaceid',
                        to: 'directiontospace.directionid',
                        extra: {
                            linkerid: 'id',
                            halfaxisid: 'halfaxisid',
                            onewayaxisinoutline: "onewayaxisinoutline"
                        }
                    },
                    to: 'directions.id'
                }
            },

            directionToSpaces: {
                relation: Model.HasManyRelation,
                modelClass: RawDirectionToSpaceDbModel,
                join: {
                    from: 'spaces.id',
                    to: 'directiontospace.spaceid'
                }
            }
        }
    }
}

interface NewSpaceInfo {
    id: number
    text: string
    whencreated: null
    whenmodded: null
    spaceorder: number
    buildmethod: string
}

export function getNewSpaceInfo(id: number, text: string, spaceOrder: number, buildMethod: "radial" | "grid"): NewSpaceInfo {
    const newSpaceInfo = {
        id: id,
        text: text,
        whencreated: null,
        whenmodded: null,
        spaceorder: spaceOrder,
        buildmethod: buildMethod
    }

    return newSpaceInfo
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripSpaceDbModels(models: RawSpaceDbModel[]): SpaceDbModel[] {
    const stripped = []
    
    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                text: model.text,
                spaceorder: model.spaceorder,
                buildmethod: model.buildmethod,
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
    halfaxisid!: string | number | null
    onewayaxisinoutline!: boolean | null
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripDirectionToSpaceDbModels(models: RawDirectionToSpaceDbModel[]): DirectionToSpaceDbModel[] {
    const stripped = []
    
    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                directionid: model.directionid,
                spaceid: model.spaceid,
                halfaxisid: model.halfaxisid,
                onewayaxisinoutline: model.onewayaxisinoutline
            }
        )
    }

    return stripped
}