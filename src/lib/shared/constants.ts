import type { Space, Direction, Thing, Relationship } from "$lib/models/constructModels"


/*
 * "Constants" that will eventually be moved into an editable config file.
 */
export const unigraphFolder = "C:/Users/mtgra/Desktop/LifeSeahorse_test/LifeGrid_graph"
export const startingGraphDepth = 1
export const zoomBase = 1.45


/*
 * App-level interfaces and types.
 */
export interface ServerConfig {
    serverPort: number
    dbPort: number
    graphsFolder: string
}

export interface AppConfig {
    unigraphFolder: string | null
}

export interface WaitingIndicatorStates {
    [stateName: string]: {
        text: string,
        imageName: null | "waiting" | "error"
    }
}

/*
 * Graph-level interfaces and types.
 */
export interface GraphConfig {
    uIBackgroundColor?: string
    uITrimColor?: string
    readOnlyMode: boolean
    leftSideMenu: string | null
    rightSideMenu: string | null
    notesEditorLocked: boolean
    homeThingId: number | null
    pinIds: number[]
    perspectiveThingId: number | null
}

export type GraphConstruct = Direction | Space | Thing | Relationship

/*
 * Text parameters.
 */
export const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

export const headerLevels = [ 1, 2, 3, 4, 5, 6, null ] as const
    

/*
 * Layout parameters.
 */
export const planePadding = 20


/*
 * Graph constants.
 */
export type HalfAxisId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const halfAxisIds = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const
export const halfAxisOppositeIds = {0: null, 1: 2, 2: 1, 3: 4, 4: 3, 5: 6, 6: 5, 7: 8, 8: 7} as const
export type OddHalfAxisId = 1 | 3 | 5 | 7
export const oddHalfAxisIds = [1, 3, 5, 7] as const
export const cartesianHalfAxisIds = [1, 2, 3, 4] as const



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


export const hyperlinkProtocols = [
    "http",
    "https",
    "mailto",
    "file",
    "ftp",
    "news",
    "telnet"
]


export const maxThingsToStore = 500

export const dateDividerOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short"
} as const


export const defaultUIBackgroundColor = "#fafafa"
export const defaultUITrimColor = "#E8E8E8"