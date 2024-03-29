import type { RelationMappings, RelationMappingsThunk } from "objection"
import type { DirectionDbModel } from "$lib/models/dbModels"
import { Model } from "objection"
import { RawDirectionToSpaceDbModel } from "./spaceDbModel"


/*
 * Direction model.
 */
export class RawDirectionDbModel extends Model {
    static tableName = "directions" as const

    id!: string | number
    oppositeid!: number | null
    text!: string | null
    nameforobjects!: string | null
    directionorder!: number | null
    linkerid!: number | null
    halfaxisid!: number | null
    onewayaxisinoutline!: boolean | null


    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            directionToSpaces: {
                relation: Model.HasManyRelation,
                modelClass: RawDirectionToSpaceDbModel,
                join: {
                    from: 'directions.id',
                    to: 'directiontospace.directionid'
                }
            }
        }
    }



}


interface NewDirectionInfo {
    id: number
    text: string
    nameforobjects: string
    oppositeid: number | null
    whencreated: null
    whenmodded: null
    directionorder: number
}

export function getNewDirectionInfo(
    id: number,
    text: string,
    nameForObjects: string,
    oppositeId: number | null,
    directionOrder: number
): NewDirectionInfo {
    const newDirectionInfo = {
        id: id,
        text: text,
        nameforobjects: nameForObjects,
        oppositeid: oppositeId,
        whencreated: null,
        whenmodded: null,
        directionorder: directionOrder
    }

    return newDirectionInfo
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripDirectionDbModels(models: RawDirectionDbModel[]): DirectionDbModel[] {
    const stripped: DirectionDbModel[] = []
    
    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                oppositeid: model.oppositeid,
                text: model.text,
                nameforobjects: model.nameforobjects,
                directionorder: model.directionorder,
                linkerid: model.linkerid,
                halfaxisid: model.halfaxisid,
                onewayaxisinoutline: model.onewayaxisinoutline
            }
        )
    }

    return stripped
}