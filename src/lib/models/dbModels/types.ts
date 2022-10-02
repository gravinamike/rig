import type { DirectionDbModel } from "./directionDbModel"
import type { SpaceDbModel } from "./spaceDbModel"
import type { ThingDbModel } from "./thingDbModel"
import type { RelationshipDbModel } from "./relationshipDbModel"


export type GraphDbModel = DirectionDbModel | SpaceDbModel | ThingDbModel | RelationshipDbModel

/*
 * Typeguard functions for Graph DB model classes.
 */
export function isDirectionDbModel(construct: GraphDbModel): construct is DirectionDbModel {
    return "oppositeid" in construct
}

export function isSpaceDbModel(construct: GraphDbModel): construct is SpaceDbModel {
    return "directions" in construct
}

export function isThingDbModel(construct: GraphDbModel): construct is ThingDbModel {
    return "note" in construct
}