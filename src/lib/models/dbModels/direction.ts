import type { GraphConstruct } from "$lib/shared/constants"
import type { Space } from "$lib/models/dbModels/space"

import { Model } from "objection"


/*
 * Direction model.
 */
export class Direction extends Model {
    static tableName = "directions" as const

    id!: number
    oppositeid!: number | null
    text!: string | null
    nameforobjects!: string | null
    spaces!: Space[]
}

/*
 * Typeguard functions for Graph construct class.
 */
export function isDirection(construct: GraphConstruct): construct is Direction {
    return "oppositeid" in construct
}