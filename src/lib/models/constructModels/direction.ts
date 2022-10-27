import type { GraphConstruct } from "$lib/shared/constants"
import type { DirectionDbModel } from "../dbModels/clientSide"



/*
 * Direction model.
 */
export class Direction {
    dbModel: DirectionDbModel | null

    id: number | null
    oppositeid: number | null
    text: string | null
    nameforobjects!: string | null

    constructor(dbModel: DirectionDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.oppositeid = dbModel.oppositeid
        this.text = dbModel.text
        this.nameforobjects = dbModel.nameforobjects
    }
}

/*
 * Typeguard functions for Graph construct classes.
 */
export function isDirection(construct: GraphConstruct): construct is Direction {
    return "oppositeid" in construct
}