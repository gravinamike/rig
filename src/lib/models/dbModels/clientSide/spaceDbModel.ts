import type { DirectionDbModel } from "./directionDbModel"


export interface SpaceDbModel {
    id: string | number | null
    text: string | null
    directions: DirectionDbModel[]
}