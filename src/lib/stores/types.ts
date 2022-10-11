export interface ReorderingInfo{
    sourceThingId: number | null
    destThingDirectionId: number | null
    destThingId: number | null
    newIndex: number | null
    trackingMouse: boolean
}

export const nullReorderingInfo: ReorderingInfo = {
    sourceThingId: null,
    destThingDirectionId: null,
    destThingId: null,
    newIndex: null,
    trackingMouse: false
}