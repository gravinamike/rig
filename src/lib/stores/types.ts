export interface ReorderingInfo{
    sourceThingId: number | null,
    destThingId: number | null
    destThingIndex: number | null
    trackingMouse: boolean
}

export const nullReorderingInfo: ReorderingInfo = {
    sourceThingId: null,
    destThingId: null,
    destThingIndex: null,
    trackingMouse: false
}