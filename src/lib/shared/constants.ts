import type { Direction } from "$lib/shared/graph/constructs/direction"
import type { Space } from "$lib/shared/graph/constructs/space"
import type { Thing } from "$lib/shared/graph/constructs/thing"
import type { Relationship } from "$lib/shared/graph/constructs/relationship"


/*
 * "Constants" that will eventually be moved into a mutable config file.
 */
export const startingPThingIds = [6080]
export const startingGraphDepth = 1
export const zoomBase = 1.45


/*
 * App-level interfaces and types.
 */
export interface Config {
    pinIds: number[]
}

/*
 * Graph-level interfaces and types.
 */
export type GraphConstruct = Direction | Space | Thing | Relationship

export interface GraphWidgetStyle {
    zoom: number,
    zoomPadding: number,
    offsetLength: number,
    thingSize: number,
    betweenThingGap: number,
    relationshipTextSize: number,
    thingTextSize: number,
}


/*
 * Layout parameters.
 */
export const navHeight = "3rem"
export const planePadding = 20


/*
 * Graph constants.
 */
export type HalfAxisId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const halfAxisIds = [1, 2, 3, 4, 5, 6, 7, 8] as const
export const oddHalfAxisIds = [1, 3, 5, 7] as const
export const cartesianHalfAxisIds = [1, 2, 3, 4] as const


/*
 * Default Graph Widget Style.
 */
export const defaultGraphWidgetStyle: GraphWidgetStyle = {
    zoom: 0,
    zoomPadding: 50,
    offsetLength: 250,
    thingSize: 100,
    betweenThingGap: 0,
    relationshipTextSize: 18,
    thingTextSize: 12
}


/*
 * Rotations specify how many degrees a Relationships Widget
 * should be rotated based on its Half Axis.
 */
export const rotationByHalfAxisId = {
    0: 0,  //Center
    1: 180,// Down
    2: 0,  // Up
    3: 90, // Right
    4: 270,// Left
    5: 0,  // Away
    6: 0,  // Towards
    7: 0,  // Inwards
    8: 0,  // Outwards
} as const


/*
 * Offset signs specify how a Cohort Widget is rendered
 * relative to its parent:
 * The first number describes the x-axis (with right being positive).
 * The second number describes the x-axis (with down being positive).
 * The third number describes the z-index (with front being positive).
 * The fourth number describes the change in "encapsulation" level
 * (with the "outwards" direction being a positive increment).
 */
export const offsetsByHalfAxisId = {
    0: [0,  0,  0,  0],// Center
    1: [0,  1,  0,  0],// Down
    2: [0, -1,  0,  0],// Up
    3: [1,  0,  0,  0],// Right
    4: [-1, 0,  0,  0],// Left
    5: [0,  0, -1,  0],// Away
    6: [0,  0,  1,  0],// Towards
    7: [0,  0,  1, -1],// Inwards////////// These two should probably get flipped at some point.
    8: [0,  0, -1,  1],// Outwards
} as const