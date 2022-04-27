import type { Direction, Space, Thing, Relationship } from "$lib/models/dbModels"


/*
 * "Constants" that will eventually be moved into a mutable config file.
 */
export const graphsBaseFolder = "C:/Rig/graphs"
export const unigraphFolder = "C:/Users/mtgra/Desktop/LifeSeahorse_test/LifeGrid_graph"
export const startingPThingIds = [6080]
export const startingGraphDepth = 1
export const zoomBase = 1.45


/*
 * App-level interfaces and types.
 */
export interface AppConfig {
    unigraphFolder: string | null
}

/*
 * Graph-level interfaces and types.
 */
export interface GraphConfig {
    pinIds: number[]
}

export type GraphConstruct = Direction | Space | Thing | Relationship

export interface GraphWidgetStyle {
    zoom: number,
    zoomPadding: number,
    relationDistance: number,
    thingSize: number,
    thingSpacingPercent: number,
    betweenThingSpacing: number,
    betweenThingGap: number,
    relationshipTextSize: number,
    thingTextSize: number,
}

/*
 * Text parameters.
 */
export const fontNames = [/////////////////////////// This should be moved to the per-Graph settings file, or to a user-settings file, since folks will want to enable their own system fonts.
    "Arial", "Calibri", "Cambria", "Century", "Chiller", "Comic Sans MS", "Cooper Black",
    "Courier New", "Forte", "Freestyle Script", "Gabriola", "Garamond", "Georgia",
    "Goudy Old Style", "Goudy Stout", "Harlow Solid Italic", "Harrington", "Impact",
    "Ink Free", "Jokerman", "MS Gothic", "MS Reference Sans Serif", "MV Boli", "Magneto",
    "Mistral", "Modern No. 20", "Monospaced", "Monotype Corsiva", "MS Shell Dlg 2", "OCR A Extended",
    "Old English Text MT", "Onyx", "Palatino Linotype", "Papyrus", "Playbill",
    "Poor Richard", "Rage Italic", "Ravie", "Rockwell", "Rockwell Condensed",
    "Rockwell Extra Bold", "SansSerif", "Script MT Bold", "Segoe Print", "Segoe Script",
    "Segoe UI", "Segoe UI Black", "Serif", "Showcard Gothic", "Snap ITC", "Stencil",
    "Tahoma", "Tempus Sans ITC", "Times New Roman", "Trebuchet MS", "Verdana", "Open Sans"
]

export const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

export const headerLevels = [ 1, 2, 3, 4, 5, 6, null ] as const
    

/*
 * Layout parameters.
 */
export const navHeight = "3rem"
export const planePadding = 20


/*
 * Graph constants.
 */
export type HalfAxisId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const halfAxisIds = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const
export const halfAxisOppositeIds = {0: null, 1: 2, 2: 1, 3: 4, 4: 3, 5: 6, 6: 5, 7: 8, 8: 7} as const
export const oddHalfAxisIds = [1, 3, 5, 7] as const
export const cartesianHalfAxisIds = [1, 2, 3, 4] as const


/*
 * Default Graph Widget Style.
 */
export const defaultGraphWidgetStyle: GraphWidgetStyle = {
    zoom: 0,
    zoomPadding: 50,
    relationDistance: 250,
    thingSize: 100,
    thingSpacingPercent: 10,
    betweenThingSpacing: 0, // Reactively calculated.
    betweenThingGap: 0, // Reactively calculated.
    relationshipTextSize: 16,
    thingTextSize: 12
}


/*
 * Rotations specify how many degrees a Relationships Widget
 * should be rotated based on its Half Axis.
 */
export const rotationByHalfAxisId = {
    0: 0,  // Center
    1: 0,  // Down
    2: 0,  // Up
    3: 90, // Right
    4: 90, // Left
    5: 0,  // Away
    6: 0,  // Towards
    7: 0,  // Inwards
    8: 0,  // Outwards
} as const

/*
 * Mirrorings specify how a Relationships Widget should (or
 * should not) be mirrored based on its Half Axis.
 */
export const mirroringByHalfAxisId = {
    0: 1,  // Center
    1: -1, // Down
    2: 1,  // Up
    3: 1,  // Right
    4: -1, // Left
    5: 1,  // Away
    6: 1,  // Towards
    7: 1,  // Inwards
    8: 1,  // Outwards
} as const

/*
 * Relationship colors specify how Relationship Images should
 * be colored based on their Half Axes.
 */
export const relationshipColorByHalfAxisId = {
    0: "#000000", //Center
    1: "#ff3f3f", // Down
    2: "#bf0000", // Up
    3: "#40bf00", // Right
    4: "#407f00", // Left
    5: "#000000", // Away
    6: "#000000", // Towards
    7: "#000000", // Inwards
    8: "#000000", // Outwards
} as const


/*
 * Offset signs specify how a Cohort Widget is rendered
 * relative to its parent:
 * The first number describes the x-axis (with right being positive).
 * The second number describes the y-axis (with down being positive).
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