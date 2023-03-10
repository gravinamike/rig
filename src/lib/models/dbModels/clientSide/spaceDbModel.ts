import type { DirectionDbModel } from "./directionDbModel"


export interface SpaceDbModel {
    id: string | number | null
    text: string | null
    spaceorder: number | null
    directions: DirectionDbModel[]
}


export interface DirectionToSpaceDbModel {
    id: string | number | null
    directionid: string | number | null
    spaceid: string | number | null
    halfaxisid: string | number | null
}