import type { SpaceDbModel } from "$lib/models/dbModels"

import { Model } from "objection"


/*
 * Direction model.
 */
export class DirectionDbModel extends Model {
    static tableName = "directions" as const

    id!: string | number
    oppositeid!: number | null
    text!: string | null
    nameforobjects!: string | null
    spaces!: SpaceDbModel[]
}