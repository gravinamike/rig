export interface DirectionDbModel {
    id: string | number
    oppositeid: number | null
    text: string | null
    nameforobjects: string | null
    directionorder: number | null
    linkerid: number | null
    halfaxisid: number | null
    onewayaxisinoutline: boolean | null
}