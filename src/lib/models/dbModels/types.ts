import type { DirectionDbModel } from "./directionDbModel"
import type { SpaceDbModel } from "./spaceDbModel"
import type { ThingDbModel } from "./thingDbModel"
import type { RelationshipDbModel } from "./relationshipDbModel"


export type GraphConstructDbModel = DirectionDbModel | SpaceDbModel | ThingDbModel | RelationshipDbModel

/*
 * Typeguard functions for Graph DB model classes.
 */
export function isDirectionDbModel(construct: GraphConstructDbModel): construct is DirectionDbModel {
    return "oppositeid" in construct
}

export function isSpaceDbModel(construct: GraphConstructDbModel): construct is SpaceDbModel {
    return "directions" in construct
}

export function isThingDbModel(construct: GraphConstructDbModel): construct is ThingDbModel {
    return "note" in construct
}