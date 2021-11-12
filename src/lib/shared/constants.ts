/*
 * Offset signs specify how a Cohort Widget is rendered
 * relative to its parent:
 * The first number describes the x-axis (with right being positive).
 * The second number describes the x-axis (with down being positive).
 * The third number describes the z-index (with front being positive).
 */
export const offsetSignsByHalfAxisId = {
    0: [0,  0,  0],// Center
    1: [0,  1,  0],// Down
    2: [0, -1,  0],// Up
    3: [1,  0,  0],// Right
    4: [-1, 0,  0],// Left
    5: [0,  0, -1],// Away
    6: [0,  0,  1],// Towards
    7: [0,  0,  1],// Inwards////////// These two should probably get flipped at some point.
    8: [0,  0,  -1],// Outwards
} as const