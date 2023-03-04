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