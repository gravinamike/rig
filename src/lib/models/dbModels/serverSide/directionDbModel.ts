import type { DirectionDbModel } from "../clientSide"
import { Model } from "objection"


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
}


interface NewDirectionInfo {
    id: number
    text: string
    nameforobjects: string
    oppositeid: number | null
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
                halfaxisid: model.halfaxisid
            }
        )
    }

    return stripped
}